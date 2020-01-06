import StorageService from "@js/Services/StorageService";
import Server from "@js/Models/Server/Server";
import uuid from 'uuidv4';
import LocalisationService from "@js/Services/LocalisationService";
import ServerRepository from '@js/Repositories/ServerRepository';

class UpgradeManager {

    constructor() {
        this._version = 20000;
    }

    async run() {
        let version = await StorageService.get('version');

        if(version === null) {
            await StorageService.set('version', this._version, StorageService.STORAGE_SYNC);
            return;
        } else if(version === this._version) {
            return;
        }

        if(version === 10500) {
            this._upgrade150();
        }

        await Promise.all(
            [
                StorageService.remove('version', StorageService.STORAGE_LOCAL),
                StorageService.set('version', this._version, StorageService.STORAGE_SYNC)
            ]);
    }

    async _upgrade150() {
        let url      = await StorageService.get('url', StorageService.STORAGE_SYNC),
            user     = await StorageService.get('user', StorageService.STORAGE_SYNC),
            theme    = await StorageService.get('theme', StorageService.STORAGE_SYNC),
            password = await StorageService.get('password', StorageService.STORAGE_LOCAL);

        if(url.substr(-1, 1) !== '/') {
            url += '/';
        }

        let server = new Server(
            {
                id         : uuid(),
                label      : LocalisationService.translate('MigrationAccountName'),
                baseUrl    : url,
                user,
                token      : password,
                rootFolder : '00000000-0000-0000-0000-000000000000',
                inboxFolder: null,
                inboxTag   : null
            }
        );

        await StorageService.set('servers', '{}', StorageService.STORAGE_SYNC);

        await ServerRepository.create(server);
    }
}

export default new UpgradeManager();