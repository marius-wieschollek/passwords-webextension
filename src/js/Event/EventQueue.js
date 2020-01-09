import ErrorManager from '@js/Manager/ErrorManager';

export default class EventQueue {

    constructor() {
        this._listeners = [];
        this._once = [];
    }

    /**
     *
     * @param {Object} data
     * @return {Promise<void>}
     */
    async emit(data) {
        await this._notifyListeners(data);
        await this._notifyOnce(data);
    }

    /**
     *
     * @param {Function} callback
     */
    on(callback) {
        this._listeners.push(callback);
    }

    /**
     *
     * @param {Function} callback
     */
    off(callback) {
        for(let i = 0; i < this._listeners.length; i++) {
            if(this._listeners[i] === callback) {
                this._listeners.splice(i, 1);
                i--;
            }
        }
    }

    /**
     *
     * @return {Promise<Object>}
     */
    once() {
        return new Promise((resolve) => {
            this._once.push(resolve);
        });
    }

    /**
     *
     * @param {Object} data
     * @return {Promise<void>}
     * @private
     */
    async _notifyListeners(data) {
        for(let callback of this._listeners) {
            try {
                await callback(data);
            } catch(e) {
                ErrorManager.logError(e);
            }
        }
    }

    /**
     *
     * @param {Object} data
     * @return {Promise<void>}
     * @private
     */
    async _notifyOnce(data) {
        let callback;
        while(callback = this._once.pop()) {
            try {
                await callback(data);
            } catch(e) {
                ErrorManager.logError(e);
            }
        }
    }
}