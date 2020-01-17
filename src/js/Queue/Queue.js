import MessageService from '@js/Services/MessageService';
import Message from '@js/Models/Message/Message';
import QueueItem from '@js/Models/Queue/QueueItem';

export default class Queue {

    /**
     *
     * @param {String}      name
     * @param {(String|null)} [area=null]
     * @param {QueueItem}   [type=QueueItem]
     */
    constructor(name, area = null, type = QueueItem) {
        this._name = name;
        this._items = {};
        this._count = 0;
        this._type = type;
        this._area = area;

        MessageService.listen(
            'queue.fetch',
            (m, r) => { this._fetchMessages(m, r); }
        );

        MessageService.listen(
            'queue.consume',
            (m, r) => { this._consumeMessages(m, r); }
        );
    }

    /**
     *
     * @return {Boolean}
     */
    hasItems() {
        return this._count !== 0;
    }

    /**
     *
     * @param {QueueItem|{}} item
     * @returns {Promise<QueueItem>}
     */
    push(item) {
        item = this._validateItem(item);

        console.debug('queue.push', item);

        this._count++;
        return new Promise((resolve, reject) => {
            this._items[item.getId()] = {
                item,
                resolve,
                reject
            };

            MessageService.send(
                {
                    type    : 'queue.items',
                    payload : {
                        name : this._name,
                        items: [item]
                    },
                    receiver: this._area
                }
            );
        });
    }

    /**
     *
     * @param {{}} data
     * @returns {QueueItem}
     */
    makeItem(data) {
        if(!data.hasOwnProperty('task')) {
            data = {task: data};
        }

        return new this._type(data);
    }

    /**
     *
     * @param {Message} message
     * @param {Message} reply
     * @private
     */
    _fetchMessages(message, reply) {
        if(message.getPayload().name !== this._name) return;

        let items = [];
        for(let id in this._items) {
            items.push(this._items[id].item);
        }

        console.debug('queue.fetch', items);

        reply
            .setType('queue.items')
            .setPayload(
                {
                    name: this._name,
                    items
                }
            );
    }

    /**
     *
     * @param {Message} message
     * @param {Message} reply
     * @private
     */
    _consumeMessages(message, reply) {
        if(message.getPayload().name !== this._name) return;
        let items = message.getPayload().items;

        for(let data of items) {
            if(!this._items.hasOwnProperty(data.id)) continue;

            let {item, resolve, reject} = this._items[data.id];
            item.setResult(data.result);
            item.setSuccess(data.success);

            if(item.getSuccess()) {
                if(resolve) resolve(item);
            } else if(reject) {
                reject(item);
            }

            this._count--;
            delete this._items[data.id];
        }
    }

    /**
     *
     * @param {QueueItem|{}} item
     * @returns {QueueItem}
     * @protected
     */
    _validateItem(item) {
        if(item instanceof this._type) {
            return item;
        }

        return this.makeItem(item);
    }
}