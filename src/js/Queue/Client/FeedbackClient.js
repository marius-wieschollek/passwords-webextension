import QueueClient from '@js/Queue/Client/QueueClient';
import FeedbackItem from '@js/Models/Queue/FeedbackItem';

export default class FeedbackClient extends QueueClient {

    /**
     *
     * @param {string} name
     * @param {Function} callback
     * @param {Function} feedback
     * @param {FeedbackItem} type
     */
    constructor(name, callback, feedback = null, type = FeedbackItem) {
        super(name, callback, type);
        this._feedback = feedback;
    }

    /**
     *
     * @param {FeedbackItem} item
     * @param {Function} callback
     * @returns {Promise<void>}
     * @private
     */
    async _executeCallback(item, callback) {
        if(item.getSuccess() !== null && this._feedback) {
            callback = this._feedback;
        }

        await super._executeCallback(item, callback);

        if(!item.getAccepted()) {
            item.setFeedback({});
        }
    }
}