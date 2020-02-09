import SystemService from '@js/Services/SystemService';
import ErrorManager from '@js/Manager/ErrorManager';
import EventQueue from '@js/Event/EventQueue';

class StorageService {

    get STORAGE_SYNC() {
        return 'sync';
    }

    get STORAGE_LOCAL() {
        return 'local';
    }

    get sync() {
        return this._onSync;
    }

    constructor() {
        this._api = SystemService.getBrowserApi();
        this._onSync = new EventQueue();
        this._syncChanges = 0;
        this._api.storage.onChanged.addListener(
            (d,a) => { this._onChangeListener(d,a); }
        );
        this._api.storage.sync.get().then(console.log);
    }

    /**
     *
     * @param {String} key
     * @param {*} value
     * @param {String} storage
     * @returns {Promise<Boolean>}
     */
    async set(key, value, storage = 'sync') {
        try {
            let set = {};
            set[key] = JSON.stringify(value);
            if(storage === this.STORAGE_SYNC) this._syncChanges++;
            await this._api.storage[storage].set(set);
            if(storage === this.STORAGE_SYNC) this._syncChanges--;
            return true;
        } catch(e) {
            if(storage === this.STORAGE_SYNC) this._syncChanges--;
            ErrorManager.logError(e);
            return false;
        }
    }

    /**
     *
     * @param {String} key
     * @param {(String|null)} storage
     * @returns {Promise<*>}
     */
    async get(key, storage = null) {
        if(storage !== null) {
            return await this._getFromStorage(key, storage);
        } else {
            return await this._getFromAnyStorage(key);
        }
    }

    /**
     *
     * @param {String} key
     * @param {(String|null)} storage
     * @returns {Promise<Boolean>}
     */
    async has(key, storage = null) {
        if(storage !== null) {
            return await this._storageHas(key, storage);
        } else {
            for(let storage of ['local', 'sync']) {
                if(await this._storageHas(key, storage)) return true;
            }

            return false;
        }
    }

    /**
     *
     * @param {String} key
     * @param {(String|null)} storage
     * @returns {Promise<Boolean>}
     */
    async remove(key, storage = null) {
        if(storage !== null) {
            return await this._storageRemove(key, storage);
        } else {
            let result = true;
            for(let storage of ['local', 'sync']) {
                result = await this._storageRemove(key, storage) && result;
            }

            return result;
        }
    }

    async _getFromStorage(key, storage) {
        try {
            let result = await this._api.storage[storage].get(key);
            if(result.hasOwnProperty(key)) return JSON.parse(result[key]);
        } catch(e) {
            ErrorManager.logError(e);
        }
        return null;
    }

    async _getFromAnyStorage(key) {
        for(let storage of ['local', 'sync']) {
            try {
                let result = await this._api.storage[storage].get(key);
                if(result.hasOwnProperty(key)) return JSON.parse(result[key]);
            } catch(e) {
                ErrorManager.logError(e);
            }
        }

        return null;
    }

    async _storageHas(key, storage) {
        try {
            let result = await this._api.storage[storage].get(key);

            return result.hasOwnProperty(key);
        } catch(e) {
            ErrorManager.logError(e);
        }
        return false;
    }

    async _storageRemove(key, storage) {
        try {
            if(storage === this.STORAGE_SYNC) this._syncChanges++;
            await this._api.storage[storage].remove(key);
            if(storage === this.STORAGE_SYNC) this._syncChanges--;

            return true;
        } catch(e) {
            if(storage === this.STORAGE_SYNC) this._syncChanges--;
            ErrorManager.logError(e);
        }
        return false;
    }

    /**
     * @param {Object} changes
     * @param {String} area
     *
     * @private
     */
    _onChangeListener(changes, area) {
        if(this._syncChanges < 1 && area === 'sync') {
            this._onSync.emit(changes);
        }
    }
}

export default new StorageService();