import AuthorisationItem from '@js/Models/Queue/AuthorisationItem';
import FeedbackClient    from '@js/Queue/Client/FeedbackClient';
import PopupStateService from '@js/Services/PopupStateService';

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
     * @returns {(AuthorisationItem|null)}
     */
    getCurrent() {
        if(this._current == null) {
            let keys = Object.keys(this._items);
            if(keys.length === 0) return null;
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

            PopupStateService.setStatus('authorized', false);
        });
    }

    /**
     *
     * @param {AuthorisationItem} item
     * @returns {Promise<AuthorisationItem>}
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
                if(this._current === item.getId()) this._current = null;
                delete this._items[item.getId()];
                queue.resolve(item);
                resolve();

                if(Object.keys(this._items).length === 0) {
                    PopupStateService.setStatus('authorized', true);
                }

                return;
            }

            queue.reject(item);
            this._items[item.getId()] = {
                item,
                resolve,
                reject
            };

            PopupStateService.setStatus('authorized', false);
        });
    }
}