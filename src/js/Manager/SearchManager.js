import ServerManager from '@js/Manager/ServerManager';
import ApiRepository from '@js/Repositories/ApiRepository';
import ErrorManager from '@js/Manager/ErrorManager';
import HiddenFolderHelper from "@js/Helper/HiddenFolderHelper";
import SearchService from "@js/Services/SearchService";
import {subscribe} from "@js/Event/Events";
import ConnectionErrorHelper from "@js/Helper/ConnectionErrorHelper";

class SearchManager {

    constructor() {
        this._refreshTimer = {};
        this._connectionError = new ConnectionErrorHelper();
    }

    init() {
        subscribe('server:added', async (s) => { await this._addServer(s); });
        subscribe('server:removed', async (s) => { await this._removeServer(s); });
        subscribe('server:deleted', async (s) => { await this._removeServer(s); });
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
        this._refreshTimer[serverId] = setInterval(() => { this._reloadServer(api); }, 900000);

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
        clearInterval(this._refreshTimer[serverId]);
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
                    ErrorManager.log('Server not authenticated during reindex');
                    await ServerManager.restartSession(api.getServer());
                } catch(e2) {
                    ErrorManager.logError(e);
                    ErrorManager.logError(e2);
                }
            } else if(e.name === 'UnauthorizedError') {
                this._connectionError
                    .processError(e, api.getServer())
                    .catch(ErrorManager.catch);
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