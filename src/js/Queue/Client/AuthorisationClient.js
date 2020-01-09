import Popup from '@js/App/Popup';
import AuthorisationItem from '@js/Models/Queue/AuthorisationItem';
import FeedbackClient from '@js/Queue/Client/FeedbackClient';

export default class AuthorisationClient extends FeedbackClient {

    constructor() {
        let worker = (i) => { return this._worker(i); };
        let feedbackWorker = (i) => { return this._feedbackWorker(i); };
        super('authorisation', worker, feedbackWorker, AuthorisationItem);

        this._items = [];
        this._solvedItems = [];
        this._current = null;
    }

    /**
     *
     * @returns {AuthorisationItem}
     */
    getCurrent() {
        if(this._current == null) {
            let keys = Object.keys(this._items);
            this._current = keys.shift();
        }

        return this._items[this._current].item;
    }

    /**
     *
     * @returns {Promise<unknown>}
     */
    solveCurrent() {
        return new Promise((resolve, reject) => {
            let current = this._items[this._current],
                item    = current.item;

            this._solvedItems[item.getId()] = {
                item,
                resolve,
                reject
            };

            current.resolve(item);
        });
    }

    /**
     *
     * @param {AuthorisationItem} item
     * @returns {Promise<AuthorisationItem>}
     * @private
     */
    _worker(item) {
        return new Promise((resolve, reject) => {
            this._items[item.getId()] = {
                item,
                resolve,
                reject
            };

            if(Popup.app) Popup.app.isAuthorized = false;
        });
    }

    /**
     *
     * @param {AuthorisationItem} item
     * @returns {Promise<AuthorisationItem>}
     * @private
     */
    _feedbackWorker(item) {
        return new Promise((resolve, reject) => {
            if(!this._solvedItems.hasOwnProperty(item.getId())) {
                resolve(item);
            }

            let queue = this._solvedItems[item.getId()];
            delete this._solvedItems[item.getId()];

            if(item.getAccepted()) {
                if(this._current === item.getId()) this._current = null;
                delete this._items[item.getId()];
                queue.resolve(item);
                resolve();

                if(Object.keys(this._items).length === 0) {
                    if(Popup.app) Popup.app.isAuthorized = true;
                }

                return;
            }

            queue.reject(item);
            this._items[item.getId()] = {
                item,
                resolve,
                reject
            };

            if(Popup.app) Popup.app.isAuthorized = false;
        });
    }
}