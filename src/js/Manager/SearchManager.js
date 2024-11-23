import ServerManager from '@js/Manager/ServerManager';
import ApiRepository from '@js/Repositories/ApiRepository';
import ErrorManager from '@js/Manager/ErrorManager';
import HiddenFolderHelper from "@js/Helper/HiddenFolderHelper";
import SearchService from "@js/Services/SearchService";
import BrowserApi from "@js/Platform/BrowserApi";

class SearchManager {

    init() {
        ServerManager.onAddServer.on(
            async (s) => { await this._addServer(s); }
        );
        ServerManager.onRemoveServer.on(
            async (s) => { await this._removeServer(s); }
        );
        ServerManager.onDeleteServer.on(
            async (s) => { await this._removeServer(s); }
        );
        this._refreshTimer = {};
    }

    /**
     *
     * @param {Server} server
     * @returns {Promise<void>}
     */
    async reloadServer(server) {
        let api = await ApiRepository.findById(server.getId());
        await this._reloadServer(api);
    }

    /**
     *
     * @param {Server} server
     * @returns {Promise<void>}
     * @private
     */
    async _addServer(server) {
        let serverId = server.getId(),
            api      = await ApiRepository.findById(serverId);

        let alarmName = `passwords.server.refresh.${serverId}`,
            listener  = (alarm) => {
                if(alarm.name === alarmName) {
                    this._reloadServer(api);
                }
            };
        BrowserApi.getBrowserApi().alarms.create(alarmName, {delayInMinutes: 5, periodInMinutes: 15});
        BrowserApi.getBrowserApi().alarms.onAlarm.addListener(listener);
        this._refreshTimer[serverId] = listener;

        await this._reloadServer(api);
    }

    /**
     *
     * @param {Server} server
     * @returns {Promise<void>}
     * @private
     */
    async _removeServer(server) {
        let serverId = server.getId(),
            items    = SearchService.find()
                                    .where('server', '=', serverId)
                                    .execute();

        SearchService.remove(items);
        BrowserApi.getBrowserApi().alarms.onAlarm.removeListener(this._refreshTimer[serverId]);
        delete this._refreshTimer[serverId];
    }

    /**
     *
     * @param {PasswordsClient} api
     * @return {Promise<void>}
     * @private
     */
    async _reloadServer(api) {
        try {
            if(!api.isAuthorized()) {
                await ServerManager.restartSession(api.getServer());
            }

            await Promise.all(
                [
                    this._reloadRepository(api, 'password'),
                    this._reloadRepository(api, 'folder'),
                    this._reloadRepository(api, 'tag')
                ]
            );
            await this._loadHiddenPasswords(api);
        } catch(e) {
            if(e.name === 'EncryptionNotEnabledError' || e.name === 'MissingEncryptionKeyError' || e.name === 'PreconditionFailedError') {
                try {
                    await ServerManager.restartSession(api.getServer());
                } catch(e2) {
                    ErrorManager.logError(e);
                    ErrorManager.logError(e2);
                }
            } else {
                ErrorManager.logError(e);
            }
        }
    }

    /**
     *
     * @param {PasswordsClient} api
     * @param {String} type
     * @return {Promise<void>}
     * @private
     */
    async _reloadRepository(api, type) {
        let repository = api.getInstance(`repository.${type}`),
            models     = await repository.findAll(),
            items      = SearchService.find(type)
                                      .where('server', '=', api.getServer().getId())
                                      .withHidden(true)
                                      .execute();

        SearchService.remove(items);
        SearchService.add(models.getClone());
    }

    /**
     *
     * @param api
     * @returns {Promise<void>}
     * @private
     */
    async _loadHiddenPasswords(api) {
        let helper = new HiddenFolderHelper(),
            folder = await helper.getHiddenFolder(api);

        let passwords = await folder.fetchPasswords();
        if(passwords.length !== 0) {
            SearchService.add(folder);
            SearchService.add(passwords.getClone());
        }
    }
}

export default new SearchManager();