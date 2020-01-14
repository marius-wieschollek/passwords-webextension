import FeedbackClient from '@js/Queue/Client/FeedbackClient';
import MiningItem from '@js/Models/Queue/MiningItem';
import Password from 'passwords-client/src/Model/Password';

class MiningClient extends FeedbackClient {

    constructor() {
        let worker = (i) => { return this._worker(i); };
        let feedbackWorker = (i) => { return this._feedbackWorker(i); };
        super('mining', worker, feedbackWorker, MiningItem);
        this._items = {};
        this._solvedItems = {};
    }

    getItems() {
        let items = [];

        for(let id in this._items) {
            if(!this._items.hasOwnProperty(id)) continue;
            items.push(this._items[id].item);
        }

        return items;
    }

    /**
     *
     * @param {MiningItem} item
     * @returns {Promise<MiningItem>}
     * @private
     */
    _worker(item) {
        return new Promise((resolve, reject) => {
            let password = new Password(null, item.getPassword());
            item.setPassword(password);

            this._items[item.getId()] = {
                item,
                resolve,
                reject
            };
        });
    }

    /**
     *
     * @param {MiningItem} item
     * @returns {Promise<MiningItem>}
     * @private
     */
    _feedbackWorker(item) {
        if(!this._solvedItems.hasOwnProperty(item.getId())) {
            return this._worker(item);
        }

        return new Promise((resolve, reject) => {
            let queue = this._solvedItems[item.getId()];
            delete this._solvedItems[item.getId()];

            if(item.getAccepted()) {
                delete this._items[item.getId()];
                queue.resolve(item);
                resolve();

                return;
            }

            queue.reject(item);
            this._items[item.getId()] = {
                item,
                resolve,
                reject
            };

        });
    }
}

export default new MiningClient();