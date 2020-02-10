import QueueService from '@js/Services/QueueService';
import MiningItem from '@js/Models/Queue/MiningItem';
import ServerManager from '@js/Manager/ServerManager';
import ErrorManager from '@js/Manager/ErrorManager';
import TabManager from '@js/Manager/TabManager';
import SearchQuery from '@js/Search/Query/SearchQuery';
import SearchIndex from '@js/Search/Index/SearchIndex';

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

        let task = new MiningItem()
            .addField('label', data.title)
            .addField('url', data.url)
            .addField('username', data.user.value)
            .addField('password', data.password.value)
            .setNew(true);

        this.processTask(task);
    }

    /**
     * @param {MiningItem} task
     */
    async processTask(task) {
        try {
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
            fields    = task.getFields(),
            password  = converter.fromObject(fields);

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
            /** @type EnhancedPassword[] **/
            items = query
                .where(query.field('id').in(ids))
                .type('password')
                .execute();

        for(let item of items) {
            if(data.password.value === item.getPassword()) return true;
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