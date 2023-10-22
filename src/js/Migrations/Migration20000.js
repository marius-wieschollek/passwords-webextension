import SystemService from "@js/Services/SystemService";
import SettingsService from "@js/Services/SettingsService";
import Server from "@js/Models/Server/Server";
import LocalisationService from "@js/Services/LocalisationService";
import ServerRepository from "@js/Repositories/ServerRepository";

export default class Migration20000 {

    /**
     * Migrate from old extension to the new one
     *
     * @returns {Promise<void>}
     */
    async run() {
        let storage            = SystemService.getBrowserApi().storage,
            {url, user, theme} = await storage.sync.get(['url', 'user', 'theme']),
            {password}         = await storage.local.get(['password']);

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

        await storage.sync.remove('servers');
        await ServerRepository.create(server);
        await SettingsService.set('server.default', server.getId());
        await this._removeOldVariables();
    }

    async _removeOldVariables() {
        let storage = SystemService.getBrowserApi().storage;
        await storage.local.remove(['initialized', 'password', 'updated']);
        await storage.sync.remove(['url', 'user', 'theme']);
    }
}