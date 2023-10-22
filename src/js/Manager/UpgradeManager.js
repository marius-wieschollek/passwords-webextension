import StorageService from '@js/Services/StorageService';
import Server from '@js/Models/Server/Server';
import LocalisationService from '@js/Services/LocalisationService';
import ServerRepository from '@js/Repositories/ServerRepository';
import SettingsService from '@js/Services/SettingsService';
import SystemService from '@js/Services/SystemService';

class UpgradeManager {

    get CURRENT_VERSION() {
        return 20004;
    }

    async run() {
        let version = null,
            storage = SystemService.getBrowserApi().storage,
            result  = await storage.local.get('version');

        if(result.hasOwnProperty('version')) {
            version = result.version;
        } else {
            result = await storage.sync.get('version');
            if(result.hasOwnProperty('version')) version = result.version;
        }

        if(version === null) {
            await storage.sync.set({version: this.CURRENT_VERSION});
            return;
        } else if(version === this.CURRENT_VERSION) {
            return;
        }

        if(version < 20000) {
            await this._upgrade20000();
        }

        if(version < 20004) {
            await this._upgrade20004();
        }

        if(version < 20001) {
            await this._upgrade20001();
        }

        if(version < 20002) {
            await this._upgrade20002();
        }

        if(version < 20003) {
            await this._upgrade20003();
        }

        await storage.sync.set({version: this.CURRENT_VERSION});
        await storage.local.set({version: this.CURRENT_VERSION});
    }

    async _upgrade20000() {
        let {url, user, theme} = await SystemService.getBrowserApi().storage.sync.get(['url', 'user', 'theme']);
        let {password} = await SystemService.getBrowserApi().storage.local.get(['password']);

        if(theme === 'dark') {
            await SettingsService.set('theme.current', 'dark');
        }

        if(url === null || user === null || password === null) return;
        if(url === undefined || user === undefined || password === undefined) return;
        if(url.substr(-1, 1) !== '/') url += '/';

        let server = new Server(
            {
                id         : self.crypto.randomUUID(),
                label      : LocalisationService.translate('MigrationAccountName'),
                baseUrl    : url,
                user,
                token      : password,
                rootFolder : '00000000-0000-0000-0000-000000000000',
                inboxFolder: null,
                inboxTag   : null
            }
        );

        await SystemService.getBrowserApi().storage.sync.remove('servers');
        await ServerRepository.create(server);
        await SettingsService.set('server.default', server.getId());
        await this._removeOldVariables();
    }

    async _upgrade20001() {
        await this._removeOldVariables();
        if(await SettingsService.getValue('server.default') === null) {
            let servers = await ServerRepository.findAll();

            if(servers.length > 0) {
                await SettingsService.set('server.default', servers[0].getId());
            }
        }
    }

    async _upgrade20002() {
        let servers = await ServerRepository.findAll();
        for(let server of servers) {
            server.setEnabled(true);
            await ServerRepository.update(server);
        }
    }

    async _upgrade20003() {
        let servers = await ServerRepository.findAll();
        for(let server of servers) {
            server.setTimeout(0);
            server.setLockable(false);
            await ServerRepository.update(server);
        }
    }

    async _upgrade20004() {
        await new Promise((resolve) => {
            setTimeout(resolve, 10000);
        });

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
                continue;
            }
        }

        newSyncData.keys = Object.keys(newSyncData);
        await api.sync.remove();
        await api.sync.set(newSyncData);

        let oldLocalData = await api.local.get(),
            newLocalData = {instance: instanceId};

        for(let key in oldLocalData) {
            if(!oldLocalData.hasOwnProperty(key) || key === 'version') continue;

            try {
                newLocalData[key] = {time: Date.now(), instance: instanceId, value: JSON.parse(oldLocalData[key]), version: 1};
            } catch(e) {
                continue;
            }
        }

        newLocalData.keys = Object.keys(newLocalData);
        await api.local.remove();
        await api.local.set(newLocalData);
        await StorageService.init();
    }

    async _removeOldVariables() {
        let storage = SystemService.getBrowserApi().storage;
        await storage.local.remove(['initialized', 'password', 'updated']);
        await storage.sync.remove(['url', 'user', 'theme']);
    }
}

export default new UpgradeManager();