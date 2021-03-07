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
        let hidden = TabManager.get().tab.incognito;

        let task = new MiningItem()
            .setTaskField('label', data.title)
            .setTaskField('username', data.user.value)
            .setTaskField('password', data.password.value)
            .setTaskField('url', data.url)
            .setTaskField('hidden', hidden)
            .setTaskManual(data.manual)
            .setTaskNew(true);

        if(!data.manual) {
            let basePassword = this.findPossibleUpdate(data);
            if(basePassword !== null) {
                task.setTaskField('id', basePassword.getId())
                    .setTaskField('label', basePassword.getLabel())
                    .setTaskField('url', basePassword.getUrl())
                    .setTaskField('hidden', basePassword.getHidden())
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
            .setHidden(task.getResultField('hidden'));

        this._enforcePasswordPropertyLengths(password);
        if(password.isHidden()) {
            let helper = new HiddenFolderHelper();
            password.setFolder(await helper.getHiddenFolderId(api));
        }

        await api.getPasswordRepository().update(password);
        SearchIndex.removeItem(password);
        SearchIndex.addItem(password);

        task.setAccepted(true)
            .setFeedback('MiningPasswordUpdated');
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
            if(data.user.value === item.getUserName() && data.password.value === item.getPassword()) return true;
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

        if(this._findMatchingRecommendations(data.url, data.user.value, data.password.value).length > 0) {
            return true;
        }

        return false;
    }

   /**
    * @param {String} url
    * @param {String} user
    * @param {String} password
    * @return {Array} 
    */
    _findMatchingRecommendations(url, user = null, password = null) {
        let tab = TabManager.get();
        var recommendations = RecommendationManager.getRecommendationsByUrl(url, tab.tab.incognito);
        if(user === null || password === null) {
            return recommendations;
        }
        var elements = recommendations.filter(e => 
            e.getUserName() == user && 
            e.getPassword() == password);

        return elements;
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

        let items = this._findMatchingRecommendations(data.url);
        var item = items.find(item => item._data.username === data.user.value);

        if(item !== undefined) {
            return item;
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
        data.manual = false;
        this.createItem(data)
            .catch(ErrorManager.catchEvt);
    }

    /**
     *
     * @param {Password} password
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
    }
}

export default new MiningManager();