import StorageService from "@js/Services/StorageService";
import SystemService from "@js/Services/SystemService";
import ErrorManager from "@js/Manager/ErrorManager";
import UuidHelper from "@js/Helper/UuidHelper";

export default class Migration20004 {

    static _instanceId = null;

    async sync() {
        StorageService.stop();
        await this._removeOldVariables();
        await this._migrateSyncData(this._getInstanceId());
    }

    async local() {
        StorageService.stop();
        await this._removeOldVariables();
        await this._migrateLocalData(this._getInstanceId());
        await StorageService.init();
    }

    async _migrateLocalData(instanceId) {
        let api = SystemService.getBrowserApi().storage;
        let oldLocalData = await api.local.get(),
            newLocalData = {};

        for(let key in oldLocalData) {
            if(!oldLocalData.hasOwnProperty(key) || key === 'version') continue;

            try {
                newLocalData[key] = {time: Date.now(), instance: instanceId, value: JSON.parse(oldLocalData[key]), version: 1};
            } catch(e) {
                ErrorManager.error(`Failed to migrate ${key} from local storage`);
            }
        }

        await api.local.clear();
        newLocalData.keys = Object.keys(newLocalData);
        newLocalData.instance = instanceId;
        await api.local.set(newLocalData);
    }

    async _migrateSyncData(instanceId) {
        let
            api         = SystemService.getBrowserApi().storage,
            oldSyncData = await api.sync.get(),
            newSyncData = {};

        for(let key in oldSyncData) {
            if(!oldSyncData.hasOwnProperty(key) || key === 'version') continue;
            try {
                newSyncData[key] = {time: Date.now(), instance: instanceId, value: JSON.parse(oldSyncData[key]), version: 1};
            } catch(e) {
                ErrorManager.error(`Failed to migrate ${key} from sync storage`);
            }
        }

        await api.sync.clear();
        newSyncData.keys = Object.keys(newSyncData);
        await api.sync.set(newSyncData);
    }

    async _removeOldVariables() {
        let storage = SystemService.getBrowserApi().storage;
        await storage.local.remove(['initialized', 'password', 'updated']);
        await storage.sync.remove(['url', 'user', 'theme']);
    }

    _getInstanceId() {
        if(Migration20004._instanceId === null) {
            Migration20004._instanceId = UuidHelper.generate();
        }

        return Migration20004._instanceId;
    }
}