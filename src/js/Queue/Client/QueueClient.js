import MessageService from '@js/Services/MessageService';
import QueueItem from '@js/Models/Queue/QueueItem';
import ErrorManager from '@js/Manager/ErrorManager';

export default class QueueClient {

    /**
     *
     * @param {string} name
     * @param {Function} callback
     * @param {QueueItem} type
     */
    constructor(name, callback, type = QueueItem) {
        this._name = name;
        this._type = type;
        this._callback = callback;

        MessageService.listen(
            'queue.items',
            (m, r) => { this._processItems(m, r); }
        );

        MessageService.send(
            {
                type    : 'queue.fetch',
                payload : {
                    name: this._name
                },
                receiver: 'background'
            }
        ).then((m) => {
            this._processItems(m);
        });
    }

    /**
     *
     * @returns {Function}
     */
    getCallback() {
        return this._callback;
    }

    /**
     *
     * @param {Function} value
     * @returns {QueueClient}
     */
    setCallback(value) {
        this._callback = value;

        return this;
    }

    /**
     *
     * @param {Message} message
     * @param {Message|null} reply
     * @private
     */
    _processItems(message, reply = null) {
        if(message.getPayload().name !== this._name || reply && reply.getPayload() !== null) return;

        let items = message.getPayload().items;
        for(let data of items) {
            let item = new this._type(data, message.getSender());

            this._processItem(item)
                .catch(ErrorManager.catch());
        }

        if(reply) reply.setPayload(true);
    }

    /**
     *
     * @param {QueueItem} item
     * @param {(string|null)} receiver
     * @private
     */
    async _processItem(item, receiver) {
        await this._executeCallback(item, this._callback);

        MessageService.send(
            {
                type   : 'queue.consume',
                receiver,
                payload: {
                    name : this._name,
                    items: [item]
                }
            }
        );
    }

    /**
     *
     * @param {QueueItem} item
     * @param {Function} callback
     * @returns {Promise<void>}
     * @private
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