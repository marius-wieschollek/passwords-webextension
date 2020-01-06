import QueueItem from '@js/Models/Queue/QueueItem';

export default class FeedbackItem extends QueueItem {

    /**
     *
     * @param {{}} data
     */
    constructor(data = {}) {
        super(data);
        this._feedback = data.hasOwnProperty('feedback') ? data.feedback:{};
        this._accepted = data.hasOwnProperty('accepted') ? data.accepted:false;
    }

    /**
     * 
     * @returns {{}|*}
     */
    getFeedback() {
        return this._feedback;
    }

    /**
     * 
     * @param value
     * @returns {FeedbackItem}
     */
    setFeedback(value) {
        this._feedback = value;
        
        return this;
    }

    /**
     * 
     * @returns {boolean}
     */
    getAccepted() {
        return this._accepted;
    }

    /**
     * 
     * @param {boolean} value
     * @returns {FeedbackItem}
     */
    setAccepted(value) {
        this._accepted = value === true;
        
        return this;
    }

    toJSON() {
        return {
            id      : this._id,
            task    : this._task,
            result  : this._result,
            success : this._success,
            accepted: this._accepted,
            feedback: this._feedback
        };
    }
}