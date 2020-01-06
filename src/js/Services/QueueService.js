import Queue from '@js/Queue/Queue';
import FeedbackQueue from '@js/Queue/FeedbackQueue';

class QueueService {

    constructor() {
        this._queues = {};
    }

    /**
     *
     * @param {string} name
     * @param {(string|null)} [area=null]
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
     * @param {string} name
     * @param {(string|null)} [area=null]
     * @param {FeedbackItem} [type=FeedbackItem]
     * @returns {FeedbackQueue}
     */
    getFeedbackQueue(name, area = null, type) {
        if(!this._queues.hasOwnProperty(name)) {
            this._queues[name] = new FeedbackQueue(name, null, type);
        }

        return this._queues[name];
    }
}

export default new QueueService();