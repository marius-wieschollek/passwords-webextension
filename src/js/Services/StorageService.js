import SystemService from '@js/Services/SystemService';
import ErrorManager from '@js/Manager/ErrorManager';
import UuidHelper from "@js/Helper/UuidHelper";
import {emit} from "@js/Event/Events";
import MigrationManager from "@js/Manager/MigrationManager";
import ToastService from "@js/Services/ToastService";

class StorageService {

    get STORAGE_SYNC() {
        return 'sync';
    }

    get STORAGE_LOCAL() {
        return 'local';
    }

    constructor() {
        this._api = SystemService.getBrowserApi();
        this._api.storage.onChanged.addListener(
            (d, a) => { this._onChangeListener(d, a); }
        );
        this._keys = {local: [], sync: []};
        this._storage = {local: {}, sync: {}};
        this._pendingChanges = {};
        this._instance = null;
        this._initialized = false;
        this._writeable = false;
    }

    async init() {
        let localData = new Promise(async (resolve) => {
            let result = await this._api.storage.local.get(['keys', 'instance', 'version']);

            if(result.hasOwnProperty('instance')) {
                this._instance = result.instance;
            } else {
                await this._createInstanceId();
            }

            if(MigrationManager.CURRENT_VERSION < result.version) {
                resolve();
                return;
            }

            if(result.hasOwnProperty('keys')) {
                this._keys.local = result.keys;
                this._storage.local = await this._api.storage.local.get(result.keys);

                if(this._keys.local.length !== Object.keys(this._storage.local).length) {
                    this._keys.local = Object.keys(this._storage.local);
                    await this._api.storage.local.set({keys: this._keys.local});
                }
            }

            resolve();
        });

        let syncData = new Promise(async (resolve) => {
            let result = await this._api.storage.sync.get('keys', 'version');

            this._setWriteableStatus(result.version <= MigrationManager.CURRENT_VERSION);
            if(this._writeable && result.hasOwnProperty('keys')) {
                this._keys.sync = result.keys;
                this._storage.sync = await this._api.storage.sync.get(result.keys);

                if(this._keys.sync.length !== Object.keys(this._storage.sync).length) {
                    this._keys.sync = Object.keys(this._storage.sync);
                    await this._api.storage.sync.set({keys: this._keys.sync});
                }
            }

            resolve();
        });

        await Promise.all([localData, syncData]);
        this._initialized = true;
    }

    stop() {
        this._initialized = false;
        this._keys = {local: [], sync: []};
        this._storage = {local: {}, sync: {}};
        this._pendingChanges = {};
        this._instance = null;
    }

    /**
     *
     * @param {String} key
     * @param {*} value
     * @param {String} storage
     * @returns {Promise<Boolean>}
     */
    async set(key, value, storage = 'sync') {
        if(!this._initialized || !this._writeable) return false;

        try {
            this._pendingChanges[key] = true;
            let isUpdate = this._storageHas(key, storage),
                version  = isUpdate ? this._storage[storage][key].version + 1:1;

            let dataset = {time: Date.now(), instance: this._instance, value, version};
            this._storage[storage][key] = dataset;
            if(!isUpdate) this._keys[storage].push(key);

            let storageSet = {};
            storageSet[key] = dataset;
            await this._api.storage[storage].set(storageSet);

            if(!isUpdate) await this._api.storage[storage].set({keys: this._keys[storage]});
            delete this._pendingChanges[key];
            emit('storage:set', {key, value, storage});

            return true;
        } catch(e) {
            delete this._pendingChanges[key];
            ErrorManager.logError(e);
            return false;
        }
    }

    /**
     *
     * @param {String} key
     * @param {(String|null)} storage
     * @returns {*}
     */
    get(key, storage = null) {
        if(!this._initialized) return null;

        if(storage !== null) {
            return this._getFromStorage(key, storage);
        } else {
            return this._getFromAnyStorage(key);
        }
    }

    /**
     *
     * @param {String} key
     * @param {(String|null)} storage
     * @returns {Boolean}
     */
    has(key, storage = null) {
        if(!this._initialized) return false;

        if(storage !== null) {
            return this._storageHas(key, storage);
        } else {
            for(let storage of ['local', 'sync']) {
                if(this._storageHas(key, storage)) return true;
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
        if(!this._initialized || !this._writeable) return false;

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

    _getFromStorage(key, storage) {
        if(this._storage[storage].hasOwnProperty(key)) return this._storage[storage][key].value;
        return null;
    }

    _getFromAnyStorage(key) {
        for(let storage of ['local', 'sync']) {
            if(this._storageHas(key, storage)) {
                return this._getFromStorage(key, storage);
            }
        }

        return null;
    }

    _storageHas(key, storage) {
        return this._keys[storage].indexOf(key) !== -1;
    }

    async _storageRemove(key, storage) {
        try {
            if(this._storageHas(key, storage)) {
                this._pendingChanges[key] = true;
                this._keys[storage].splice(this._keys[storage].indexOf(key), 1);
                delete this._storage[storage][key];
                await this._api.storage[storage].remove(key);
                await this._api.storage[storage].set({keys: this._keys[storage]});
                delete this._pendingChanges[key];
                emit('storage:remove', {key, storage});
            }

            return true;
        } catch(e) {
            ErrorManager.logError(e);
            if(this._pendingChanges.hasOwnProperty(key)) {
                delete this._pendingChanges[key];
            }
            return false;
        }
    }

    /**
     * @param {Object} changes
     * @param {String} area
     *
     * @private
     */
    _onChangeListener(changes, area) {
        if(!this._initialized) return;
        if(area !== 'sync') return;
        let forceFlush   = false,
            changed     = {},
            deleted     = [],
            changeCount = 0;

        for(let key in changes) {
            if(!changes.hasOwnProperty(key) || this._pendingChanges.hasOwnProperty(key) || key === 'keys'|| key === 'version') continue;
            if(key === 'version') {
                this._setWriteableStatus(changes[key].newValue <= MigrationManager.CURRENT_VERSION);

                continue;
            }

            if(!changes[key].hasOwnProperty('newValue') || !changes[key].newValue) {
                if(this._storageHas(key, area)) {
                    delete this._storage[area][key];
                    this._keys[area].splice(this._keys[area].indexOf(key), 1);
                    deleted.push(key);
                    changeCount++;
                }
                continue;
            }

            let data = changes[key].newValue;
            if(!this._storageHas(key, area)) {
                this._storage[area][key] = data;
                this._keys[area].push(key);
                changed[key] = data.value;
                changeCount++;

                continue;
            }

            let localData = this._storage[area][key];
            if(data.version > localData.version || data.time > localData.time) {
                this._storage[area][key] = data;
                this._keys[area].push(key);
                changed[key] = data.value;
                changeCount++;
            } else {
                forceFlush = true;
            }
        }

        if(forceFlush && this._writeable) {
            this._flushToStorage()
                .catch(ErrorManager.catch);
        }

        if(changeCount) {
            console.log(`Syncing ${changeCount} storage changes`, {changed, deleted}, JSON.parse(JSON.stringify(changes)));
            emit('storage:sync', {changed, deleted});
        }
    }

    _setWriteableStatus(status) {
        this._writeable = status;
        if(!status) {
            ToastService.warning('UnsupportedStorageVersion');
        }
    }

    async _createInstanceId() {
        let instanceId = UuidHelper.generate();
        this._instance = instanceId;
        await this._api.storage.local.set({instance: instanceId});
    }

    async _flushToStorage() {
        for(let area in this._storage) {
            await this._api.storage[area].set(this._storage[area]);
            await this._api.storage[area].set({keys: this._keys[area]});
            await this._api.storage[area].set({version: MigrationManager.CURRENT_VERSION});
        }
    }
}

export default new StorageService();