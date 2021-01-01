import Queue from '@js/Queue/Queue';
import FeedbackQueue from '@js/Queue/FeedbackQueue';
import QueueItem from "@js/Models/Queue/QueueItem";
import FeedbackItem from "@js/Models/Queue/FeedbackItem";

class QueueService {

    constructor() {
        this._queues = {};
    }

    /**
     *
     * @param {String} name
     * @param {(String|null)} [area=null]
     * @param type
     * @returns {Queue}
     */
    getQueue(name, area = null, type = QueueItem) {
        if(!this._queues.hasOwnProperty(name)) {
            this._queues[name] = new Queue(name, area, type);
        }

        return this._queues[name];
    }

    /**
     *
     * @param {String} name
     * @param {(String|null)} [area=null]
     * @param {FeedbackItem} [type=FeedbackItem]
     * @returns {FeedbackQueue}
     */
    getFeedbackQueue(name, area = null, type = FeedbackItem) {
        if(!this._queues.hasOwnProperty(name)) {
            this._queues[name] = new FeedbackQueue(name, area, type);
        }

        return this._queues[name];
    }

    /**
     *
     * @param {String} name
     * @return {Boolean}
     */
    hasQueue(name) {
        return this._queues.hasOwnProperty(name);
    }
}

export default new QueueService();