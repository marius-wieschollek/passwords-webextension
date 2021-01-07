import ServerManager from '@js/Manager/ServerManager';
import ApiRepository from '@js/Repositories/ApiRepository';
import SearchIndex from '@js/Search/Index/SearchIndex';
import SearchQuery from '@js/Search/Query/SearchQuery';
import ErrorManager from '@js/Manager/ErrorManager';
import HiddenFolderHelper from "@js/Helper/HiddenFolderHelper";

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
            query    = new SearchQuery(),
            items    = query
                .where(query.field('server').equals(serverId))
                .execute();

        SearchIndex.removeItems(items);
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
            await Promise.all(
                [
                    this._reloadRepository(api, 'password'),
                    this._reloadRepository(api, 'folder'),
                    this._reloadRepository(api, 'tag')
                ]
            );
            await this._loadHiddenPasswords(api);
        } catch(e) {
            if(e.name === 'EncryptionNotEnabledError' || e.name === 'MissingEncryptionKeyError') {
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
            query      = new SearchQuery(),
            items      = query
                .where(query.field('server').equals(api.getServer().getId()))
                .type(type)
                .execute();

        SearchIndex.removeItems(items);
        SearchIndex.addItems(models);
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
            SearchIndex.addItem(folder);
            SearchIndex.addItems(passwords);
        }
    }
}

export default new SearchManager();