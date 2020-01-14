import QueueService from '@js/Services/QueueService';
import MiningItem from '@js/Models/Queue/MiningItem';
import Password from 'passwords-client/src/Model/Password';

class MiningManager {

    constructor() {
        /** @type {FeedbackQueue} **/
        this._miningQueue = null;
    }


    /**
     *
     * @returns {void}
     */
    init() {
        this._miningQueue = QueueService.getFeedbackQueue('mining', null, MiningItem);
    }

    addNewPassword(data) {
        let password = new Password(null);

        password
            .setLabel(data.title)
            .setUrl(data.url)
            .setUserName(data.user.value)
            .setPassword(data.password.value);

        let task = new MiningItem()
            .setPassword(password)
            .setNew(true);

        this._miningQueue.push(task);
    }
}

export default new MiningManager();