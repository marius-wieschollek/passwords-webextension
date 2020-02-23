import MessageService from '@js/Services/MessageService';
import QueueItem from '@js/Models/Queue/QueueItem';
import ErrorManager from '@js/Manager/ErrorManager';

export default class QueueClient {

    /**
     *
     * @param {String} name
     * @param {Function} callback
     * @param {QueueItem.constructor} type
     */
    constructor(name, callback, type = QueueItem) {
        this._name = name;
        this._type = type;
        this._callback = callback;
        /** @type {(Queue|null)} **/
        this._queue = null;
        this._createListener();
        this._fetchInitialItems();
    }

    /**
     * @returns {Function}
     */
    getCallback() {
        return this._callback;
    }

    /**
     * @param {Function} value
     * @returns {QueueClient}
     */
    setCallback(value) {
        this._callback = value;

        return this;
    }

    /**
     * @param {(Queue|null)} queue
     * @param {Boolean} processItems
     */
    setQueue(queue, processItems = true) {
        this._queue = queue;

        if(queue === null || !processItems) return;
        let items = queue.getItems();
        for(let item of items) {
            this._processItem(item.toJSON())
                .catch(ErrorManager.catch());
        }
    }

    /**
     * @protected
     */
    _fetchInitialItems() {
        MessageService.send(
            {
                type    : 'queue.fetch',
                payload : {
                    name: this._name
                },
                receiver: 'background'
            }
        ).then((m) => {
            this._processItemMessage(m);
        }).catch(ErrorManager.catch);
    }

    /**
     * @protected
     */
    _createListener() {
        MessageService.listen(
            'queue.items',
            (m, r) => { this._processItemMessage(m, r); }
        );
    }

    /**
     * @param {Message} message
     * @param {(Message|null)} reply
     * @protected
     */
    _processItemMessage(message, reply = null) {
        if(message.getPayload().name !== this._name || reply && reply.getPayload() !== null) return;

        let items = message.getPayload().items;
        for(let data of items) {
            this._processItem(data)
                .catch(ErrorManager.catch);
        }

        if(reply) reply.setPayload(true);
    }

    /**
     * @param {Object} data
     * @protected
     */
    async _processItem(data) {
        /**@type {QueueItem} */
        let item = new this._type(data);
        await this._executeCallback(item, this._callback);
        this._consumeItem(item);
    }

    /**
     * @param {QueueItem} item
     * @protected
     */
    _consumeItem(item) {
        if(this._queue !== null) {
            this._queue.consume(item);
            return;
        }

        MessageService.send(
            {
                type   : 'queue.consume',
                payload: {
                    name : this._name,
                    items: [item]
                }
            }
        ).catch(ErrorManager.catch);
    }

    /**
     * @param {QueueItem} item
     * @param {Function} callback
     * @returns {Promise<void>}
     * @protected
     */
    async _executeCallback(item, callback) {
        try {
            await callback(item);
            if(item.getSuccess() === null) item.setSuccess(true);
        } catch(error) {
            ErrorManager.logError(error);
            item.setSuccess(false);
        }
    }
}