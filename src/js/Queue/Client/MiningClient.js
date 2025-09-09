import FeedbackClient from '@js/Queue/Client/FeedbackClient';
import MiningItem from '@js/Models/Queue/MiningItem';
import SystemService from "@js/Services/SystemService";
import {emit} from "@js/Event/Events";

class MiningClient extends FeedbackClient {

    constructor() {
        let worker = (i) => { return this._worker(i); };
        let feedbackWorker = (i) => { return this._feedbackWorker(i); };
        super('mining', worker, feedbackWorker, MiningItem);
        this._items = {};
        this._solvedItems = {};
    }

    /**
     *
     * @return {MiningItem[]}
     */
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
     */
    solveItem(item) {
        return new Promise((resolve, reject) => {
            let current = this._items[item.getId()];

            this._solvedItems[item.getId()] = {
                item,
                resolve,
                reject
            };

            current.item = item;
            current.resolve(item);
        });
    }

    /**
     * @private
     */
    _fetchInitialItems() {
        if(SystemService.getArea() !== SystemService.AREA_BACKGROUND) {
            super._fetchInitialItems();
        }
    }

    /**
     *
     * @param {MiningItem} item
     * @returns {Promise<MiningItem>}
     * @private
     */
    _worker(item) {
        return new Promise((resolve, reject) => {
            this._items[item.getId()] = {
                item,
                resolve,
                reject
            };

            emit('mining:client:item', item);
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