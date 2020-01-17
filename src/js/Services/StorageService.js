import SystemService from "@js/Services/SystemService";
import ErrorManager from "@js/Manager/ErrorManager";

class StorageService {

    get STORAGE_SYNC() {
        return 'sync'
    }

    get STORAGE_LOCAL() {
        return 'local'
    }

    constructor() {
        this._api = SystemService.getBrowserApi();
    }

    async set(key, value, storage = 'sync') {
        try {
            let set = {};
            set[key] = value;
            await this._api.storage[storage].set(set)
        } catch(e) {
            ErrorManager.logError(e);
        }
    }

    async get(key, storage = null) {
        if(storage !== null) {
            return await this._getFromStorage(key, storage);
        } else {
            return await this._getFromAnyStorage(key);
        }
    }

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

    async remove(key, storage = null) {
        if(storage !== null) {
            return this._api.storage[storage].remove(key);
        } else {
            for(let storage of ['local', 'sync']) {
                this._api.storage[storage].remove(key);
            }
        }
    }

    async _getFromStorage(key, storage) {
        try {
            let result = await this._api.storage[storage].get(key);
            if(result.hasOwnProperty(key)) return result[key];
        } catch(e) {
            ErrorManager.logError(e);
        }
        return null;
    }

    async _getFromAnyStorage(key) {
        for(let storage of ['local', 'sync']) {
            try {
                let result = await this._api.storage[storage].get(key);
                if(result.hasOwnProperty(key)) return result[key];
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
}

export default new StorageService();