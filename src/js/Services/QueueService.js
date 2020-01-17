import Queue from '@js/Queue/Queue';
import FeedbackQueue from '@js/Queue/FeedbackQueue';

class QueueService {

    constructor() {
        this._queues = {};
    }

    /**
     *
     * @param {String} name
     * @param {(String|null)} [area=null]
     * @returns {Queue}
     */
    getQueue(name, area = null) {
        if(!this._queues.hasOwnProperty(name)) {
            this._queues[name] = new Queue(name, area);
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
    getFeedbackQueue(name, area = null, type) {
        if(!this._queues.hasOwnProperty(name)) {
            this._queues[name] = new FeedbackQueue(name, null, type);
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