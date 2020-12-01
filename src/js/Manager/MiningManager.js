import QueueService from '@js/Services/QueueService';
import MiningItem from '@js/Models/Queue/MiningItem';
import ServerManager from '@js/Manager/ServerManager';
import ErrorManager from '@js/Manager/ErrorManager';
import TabManager from '@js/Manager/TabManager';
import SearchQuery from '@js/Search/Query/SearchQuery';
import SearchIndex from '@js/Search/Index/SearchIndex';
import NotificationService from '@js/Services/NotificationService';
import ServerRepository from '@js/Repositories/ServerRepository';
import Setting from 'passwords-client/src/Model/Setting/Setting';
import HiddenFolderHelper from "@js/Helper/HiddenFolderHelper";

class MiningManager {

    constructor() {
        /** @type {FeedbackQueue} **/
        this._miningQueue = null;
    }


    /**
     * @returns {void}
     */
    init() {
        this._miningQueue = QueueService.getFeedbackQueue('mining', null, MiningItem);
    }

    /**
     * @param {Object} data
     */
    addPassword(data) {
        this.validateData(data);
        if(this.checkIfDuplicate(data)) return;
        let hidden = TabManager.get().tab.incognito;

        let task = new MiningItem()
            .setTaskField('label', data.title)
            .setTaskField('username', data.user.value)
            .setTaskField('password', data.password.value)
            .setTaskField('url', data.url)
            .setTaskField('hidden', hidden)
            .setTaskNew(true);

        this.processTask(task);
    }

    /**
     * @param {MiningItem} task
     */
    async processTask(task) {
        try {
            NotificationService.newPasswordNotification(task);
            task = await this._miningQueue.push(task);

            if(task.isDiscarded()) {
                task.setAccepted(true)
                    .setFeedback('MiningPasswordDiscarded');
            } else if(task.isNew()) {
                await this.createPassword(task);
            }

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
            /** @type PasswordConverter **/
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

        query = new SearchQuery();
        items = query
            .where(
                query.field('password').equals(data.password.value),
                query.field('username').equals(data.user.value)
            )
            .type('password')
            .limit(1)
            .execute();

        return items.length > 0;
    }

    /**
     * @param {Object} data
     */
    validateData(data) {
        if(!data.hasOwnProperty('user')) {
            data.user = {value: '', selector: null};
        }
    }
}

export default new MiningManager();