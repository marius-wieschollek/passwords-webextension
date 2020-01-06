import Queue from '@js/Queue/Queue';
import MessageService from '@js/Services/MessageService';
import FeedbackItem from '@js/Models/Queue/FeedbackItem';

export default class FeedbackQueue extends Queue {

    /**
     *
     * @param {string}      name
     * @param {string|null} [area=null]
     * @param {QueueItem}   [type=FeedbackItem]
     */
    constructor(name, area, type = FeedbackItem) {
        super(name, area, type);
    }


    /**
     *
     * @param {FeedbackItem|{}} item
     */
    push(item) {
        item = this._validateItem(item);
        if(!item.getSuccess() || !item.getAccepted()) {
            return super.push(item);
        }

        return new Promise((resolve) => {
            MessageService.send(
                {
                    type   : 'queue.items',
                    payload: {
                        name : this._name,
                        items: [item]
                    }
                }
            );

            resolve();
        });
    }
}