import QueueService from '@js/Services/QueueService';
import MiningItem from '@js/Models/Queue/MiningItem';
import ServerManager from '@js/Manager/ServerManager';
import ErrorManager from '@js/Manager/ErrorManager';
import TabManager from '@js/Manager/TabManager';
import RecommendationManager from '@js/Manager/RecommendationManager';
import SearchQuery from '@js/Search/Query/SearchQuery';
import SearchIndex from '@js/Search/Index/SearchIndex';
import NotificationService from '@js/Services/NotificationService';
import HiddenFolderHelper from "@js/Helper/HiddenFolderHelper";
import Url from "url-parse";
import EventQueue from "@js/Event/EventQueue";
import SystemService from "@js/Services/SystemService";
import QueueClient from "@js/Queue/Client/QueueClient";
import SettingsService from "@js/Services/SettingsService";

class MiningManager {

    /**
     * @returns {Number}
     */
    get queueSize() {
        if(this._miningQueue === null) return 0;
        return this._miningQueue.length;
    }

    /**
     * @returns {EventQueue}
     */
    get addItem() {
        return this._addItem;
    }

    /**
     * @returns {EventQueue}
     */
    get solveItem() {
        return this._solveItem;
    }

    /**
     *
     */
    constructor() {
        /** @type {FeedbackQueue} **/
        this._miningQueue = null;
        this._addItem = new EventQueue();
        this._solveItem = new EventQueue();
        this._processingQueue = null;
        this._ingoredDomainsSetting = null;
    }


    /**
     * @returns {void}
     */
    init() {
        this._miningQueue = QueueService.getFeedbackQueue('mining', null, MiningItem);
        this._processingQueue = QueueService.getQueue('mine-process', SystemService.AREA_BACKGROUND);

        this._client = new QueueClient('mine-process', /**@param {QueueItem} item**/(item) => {
            let data = item.getTask();
            this._processPasswordData(data);
            item.setSuccess(true);
        });

        this._client.setQueue(this._processingQueue);
        SettingsService.get('mining.ignored-domains').then(
            (s) => { this._ingoredDomainsSetting = s; }
        );
    }

    /**
     * @param {Object} data
     */
    async addPassword(data) {
        this._processingQueue.push(
            this._processingQueue.makeItem(data)
        );
    }

    /**
     * @param {Object} data
     */
    async createItem(data) {
        let hidden = TabManager.get().tab.incognito && await SettingsService.getValue('mining.incognito.hide');

        let task = new MiningItem()
            .setTaskField('label', data.title);

        if(hidden) {
            task.setTaskField('hidden', hidden);
        }

        task.setTaskField('username', data.user.value)
            .setTaskField('password', data.password.value)
            .setTaskField('url', data.url)
            .setTaskField('hidden', hidden)
            .setTaskField('notes', '')
            .setTaskField('customFields', [])
            .setTaskField('created', '')
            .setTaskField('edited', '')
            .setTaskManual(data.manual)
            .setTaskNew(true);

        if(!data.manual) {
            let basePassword = this.findPossibleUpdate(data);
            if(basePassword !== null) {
                task.setTaskField('id', basePassword.getId())
                    .setTaskField('label', basePassword.getLabel())
                    .setTaskField('url', basePassword.getUrl())
                    .setTaskField('hidden', basePassword.getHidden())
                    .setTaskField('notes', basePassword.getNotes())
                    .setTaskField('created', basePassword.getCreated())
                    .setTaskField('edited', basePassword.getEdited())
                    .setTaskField('customFields', basePassword.getCustomFields())
                    .setTaskNew(false);
            }
        }

        await this._addItem.emit(task);

        await this.processTask(task);
    }

    /**
     * @param {MiningItem} task
     */
    async processTask(task) {
        try {
            if(task.isNew() && !task.isManual()) NotificationService.newPasswordNotification(task).catch(ErrorManager.catchEvt);
            if(!task.isNew() && !task.isManual()) NotificationService.updatePasswordNotification(task).catch(ErrorManager.catchEvt);
            task = await this._miningQueue.push(task);

            if(task.isDiscarded()) {
                task.setAccepted(true)
                    .setFeedback('MiningPasswordDiscarded');
            } else if(task.isNew()) {
                await this.createPassword(task);
            } else {
                await this.updatePassword(task);
            }

            await this._solveItem.emit(task);
            await this._miningQueue.push(task);
        } catch(e) {
            ErrorManager.logError(e);
            task
                .setFeedback(e.message)
                .setAccepted(false);

            return await this.processTask(task);
        }
    }

    /**
     * @param {MiningItem} task
     * @return {Promise<void>}
     */
    async createPassword(task) {
        let api       = await ServerManager.getDefaultApi(),
            /** @type {PasswordConverter} **/
            converter = api.getInstance('converter.password'),
            fields    = task.getResultFields(),
            password  = converter.fromObject(fields);

        if(password.getHidden()) {
            let helper = new HiddenFolderHelper();
            password.setFolder(await helper.getHiddenFolderId(api));
        }

        password = this._enforcePasswordPropertyLengths(password);
        await api.getPasswordRepository().create(password);
        SearchIndex.addItem(password);

        task.setAccepted(true)
            .setFeedback('MiningPasswordCreated');
    }

    /**
     * @param {MiningItem} task
     * @return {Promise<void>}
     */
    async updatePassword(task) {
        let api      = await ServerManager.getDefaultApi(),
            query    = new SearchQuery(),
            password = /** @type {EnhancedPassword} **/ query
                .where(query.field('id').equals(task.getResultField('id')))
                .execute()[0];

        password
            .setLabel(task.getResultField('label'))
            .setUserName(task.getResultField('username'))
            .setPassword(task.getResultField('password'))
            .setUrl(task.getResultField('url'))
            .setEdited(new Date())
            .setCustomFields(task.getResultField('customFields'))
            .setNotes(task.getResultField('notes'))
            .setFolder(await this._setFolder(api, task, password))
            .setHidden(task.getResultField('hidden'));

        password = this._enforcePasswordPropertyLengths(password);
        if(password.isHidden()) {
            let helper = new HiddenFolderHelper();
            password.setFolder(await helper.getHiddenFolderId(api));
        }

        await api.getPasswordRepository().update(password);
        password = await api.getPasswordRepository().findById(password.getId());
        SearchIndex.removeItem(password);
        SearchIndex.addItem(password);

        task.setAccepted(true)
            .setFeedback('MiningPasswordUpdated');
    }

    /**
     *
     * @param {String} property
     * @param {MiningItem} task
     * @param {EnhancedPassword} password
     * @returns {EnhancedPassword}
     * @private
     */
    async _setFolder(api, task, password) {
        if(task.getResultField('hidden') === password.getHidden()) {
            return password.getFolder();
        }

        let helper = new HiddenFolderHelper();
        let hiddenFolder = await helper.getHiddenFolderId(api);
        if(task.getResultField('hidden') && password.getFolder() !== hiddenFolder) {
            return hiddenFolder;
        } else if(!task.getResultField('hidden') && password.getFolder() === hiddenFolder) {
            return "00000000-0000-0000-0000-000000000000";
        }
        return password.getFolder();
    }

    /**
     * @param {Object} data
     * @return {Boolean}
     */
    checkIfDuplicate(data) {
        let ids   = TabManager.get('autofill.ids', []),
            query = new SearchQuery(),
            /** @type {EnhancedPassword[]} **/
            items = query
                .where(query.field('id').in(ids))
                .type('password')
                .hidden(true)
                .execute();

        for(let item of items) {
            if(data.password.value === item.getPassword()) return true;
        }

        /** @type {MiningItem[]}**/
        items = this._miningQueue.getItems();
        for(let item of items) {
            if(data.password.value === item.getResultField('password')) return true;
            if(data.user.value === item.getResultField('username')) {
                item.setTaskField('password', data.password.value);
                return true;
            }
        }

        let tab = TabManager.get();
        query = new SearchQuery();
        items = query
            .where(
                query.field('password').equals(data.password.value),
                query.field('username').equals(data.user.value),
                RecommendationManager.getFilterQuery(query, Url(data.url))
            )
            .type('password')
            .hidden(tab.tab.incognito)
            .limit(1)
            .score(0.1)
            .execute();

        return items.length > 0;
    }

    checkIfDomainAllowed(data) {
        let url = Url(data.url);

        let domains = this._ingoredDomainsSetting.getValue();
        if(domains.length === 0) return true;

        domains = domains.split(/\r?\n/);
        for(let domain of domains) {
            if(url.host.endsWith(domain.trim())) {
                return false;
            }
        }

        return true;
    }

    /**
     * @param {Object} data
     */
    validateData(data) {
        if(!data.hasOwnProperty('user')) {
            data.user = {value: '', selector: null};
        }
    }

    /**
     *
     * @param {Object} data
     * @returns {(EnhancedPassword|null)}
     */
    findPossibleUpdate(data) {
        let tab = TabManager.get();

        let url = Url(tab.url);
        if(url.host.length === 0) {
            return null;
        }

        let query = new SearchQuery(),
            items = query
                .where(
                    query.field('username').equals(data.user.value),
                    RecommendationManager.getFilterQuery(query, Url(data.url))
                )
                .type('password')
                .hidden(tab.tab.incognito)
                .limit(1)
                .score(0.1)
                .execute();

        if(items.length !== 0) {
            return items[0];
        }

        return null;
    }

    /**
     *
     * @param {Object} data
     * @private
     */
    _processPasswordData(data) {
        this.validateData(data);
        if(this.checkIfDuplicate(data)) return;
        if(!this.checkIfDomainAllowed(data)) return;
        data.manual = false;
        this.createItem(data)
            .catch(ErrorManager.catchEvt);
    }

    /**
     *
     * @param {Password} password
     * @returns {Password}
     * @private
     */
    _enforcePasswordPropertyLengths(password) {
        if(password.getLabel().length > 64) {
            password.setLabel(password.getLabel().substr(0, 64));
        }
        if(password.getUserName().length > 64) {
            password.setUserName(password.getUserName().substr(0, 64));
        }
        if(password.getPassword().length > 256) {
            password.setPassword(password.getPassword().substr(0, 256));
        }
        if(password.getUrl().length > 2048) {
            password.setUrl(password.getUrl().substr(0, 2048));
        }
        if(password.getNotes().length > 4096) {
            password.setNotes(password.getNotes().substr(0, 4096));
        }
        return this._enforcePasswordCustomPropertyLengths(password);
    }

    /**
     *
     * @param {Password} password
     * @returns {Password}
     * @private
     */
    _enforcePasswordCustomPropertyLengths(password) {
        let customFields = password.getCustomFields();
        if(Array.isArray(customFields._elements)) {
            password.setCustomFields(this._enforcePasswordCustomPropertyLengthsInObject(customFields));
        } else {
            password.setCustomFields(this._enforcePasswordCustomPropertyLengthsInArray(customFields));
        }
        return password;
    }

    /**
     *
     * @param {Array} fields
     * @returns {Array}
     * @private
     */
    _enforcePasswordCustomPropertyLengthsInArray(fields) {
        for(var i = 0; i < fields.length; i++) {
            if((fields[i].label === "" && fields[i].value === "" && fields[i].type !== "data" && fields[i].type !== "file")
               || fields[i].label === "ext:field/" && fields[i].type === 'data') {

                fields.splice(i, 1);
                i--;
            }
        }
        if(fields.length > 0) {
            while(JSON.stringify(fields).length > 8192) {
                fields.pop();
            }
        }
        return fields;
    }

    /**
     *
     * @param {Object} fields
     * @returns {Object}
     * @private
     */
    _enforcePasswordCustomPropertyLengthsInObject(fields) {
        for(var i = 0; i < fields.length; i++) {
            var field = fields.get(i);
            if((field.getLabel() === "" && field.getValue() === "" && field.getType() !== "data" && field.getType() !== "file")
               || field.getLabel() === "ext:field/" && field.getType() === 'data') {
                fields._elements.splice(i, 1);
                i--;
            }
        }
        if(fields.length > 0) {
            while(JSON.stringify(fields).length > 8192) {
                fields._elements.splice(fields.length - 1, 1);
            }
        }
        return fields;
    }
}

export default new MiningManager();