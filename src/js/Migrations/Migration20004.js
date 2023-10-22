import StorageService from "@js/Services/StorageService";
import SystemService from "@js/Services/SystemService";
import ErrorManager from "@js/Manager/ErrorManager";

export default class Migration20004 {
    async run() {
        StorageService.stop();
        await this._removeOldVariables();
        let instanceId  = self.crypto.randomUUID(),
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

        let oldLocalData = await api.local.get(),
            newLocalData = {instance: instanceId};

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
        await api.local.set(newLocalData);
        await StorageService.init();
    }

    async _removeOldVariables() {
        let storage = SystemService.getBrowserApi().storage;
        await storage.local.remove(['initialized', 'password', 'updated']);
        await storage.sync.remove(['url', 'user', 'theme']);
    }
}