import ServerRepository from '@js/Repositories/ServerRepository';
import QueueService from '@js/Services/QueueService';
import AuthorisationItem from '@js/Models/Queue/AuthorisationItem';
import ErrorManager from '@js/Manager/ErrorManager';
import SearchIndex from '@js/Search/Index/SearchIndex';
import SearchQuery from '@js/Search/Query/SearchQuery';
import ApiRepository from '@js/Repositories/ApiRepository';

class ServerManager {

    constructor() {
        this._authQueue = null;
        this._keepaliveTimer = {};
        this._refreshTimer = {};
    }

    /**
     *
     * @returns {Promise<void>}
     */
    async init() {
        this._authQueue = QueueService.getFeedbackQueue('authorisation', null, AuthorisationItem);
        await this._loadServers();
    }

    /**
     *
     * @returns {Promise<void>}
     * @private
     */
    async _loadServers() {
        let apis     = await ServerRepository.findAll(),
            promises = [];

        for(let api of apis) {
            promises.push(this.addServer(api));
        }

        await Promise.all(promises);
    }

    /**
     *
     * @param {Server} server
     * @returns {Promise<void>}
     */
    async addServer(server) {
        let serverId    = server.getId(),
            api         = await ApiRepository.findById(serverId),
            authRequest = api.getSessionAuthorisation();
        await authRequest.load();
        if(authRequest.hasChallenge()) {
            await this._getAuth(authRequest, {
                server  : server.getId(),
                password: authRequest.hasChallenge(),
                token   : authRequest.hasToken()
            });
        }

        this._keepaliveTimer[serverId] = setInterval(() => { this._keepalive(api); }, 59000);
        this._refreshTimer[serverId] = setInterval(() => { this._reloadPasswords(api); }, 900000);

        await this._addItemsToSearch(api);
    }

    /**
     *
     * @param {Server} server
     * @returns {Promise<void>}
     */
    async deleteServer(server) {
        let api = await ApiRepository.findById(server.getId());
        this._removeItemsFromSearch(api);


        let serverId = server.getId();
        clearInterval(this._keepaliveTimer[serverId]);
        delete this._keepaliveTimer[serverId];
        clearInterval(this._refreshTimer[serverId]);
        delete this._refreshTimer[serverId];

        await ApiRepository.delete(api);
        await ServerRepository.delete(server);
    }

    /**
     *
     * @param {Server} server
     * @returns {Promise<void>}
     */
    async reloadServer(server) {
        let api = await ApiRepository.findById(server.getId());
        await this._reloadPasswords(api);
    }

    /**
     *
     * @param {Api} api
     */
    _keepalive(api) {
        api
            .getRequest()
            .setPath('api/1.0/session/keepalive')
            .send()
            .catch(ErrorManager.catch());
    }

    /**
     *
     * @param {Api} api
     * @return {Promise<void>}
     * @private
     */
    async _reloadPasswords(api) {
        try {
            this._removeItemsFromSearch(api);
            await this._addItemsToSearch(api);
        } catch(e) {
            ErrorManager.logError(e);
        }
    }

    /**
     *
     * @param {SessionAuthorisation} authRequest
     * @param {AuthorisationItem} item
     * @returns {Promise<*>}
     * @private
     */
    async _getAuth(authRequest, item) {
        try {
            item = await this._authQueue.push(item);

            if(authRequest.hasChallenge()) {
                authRequest.getChallenge().setPassword(item.getPassword());
            }

            if(authRequest.hasToken()) {
                authRequest.getToken().setToken(item.getToken());
            }

            await authRequest.authorize();
            await this._authQueue.push(item.setAccepted(true));
        } catch(e) {
            ErrorManager.logError(e);
            item.setAccepted(false).setFeedback(e);

            return await this._getAuth(authRequest, item);
        }
    }

    /**
     *
     * @param {Api} api
     * @returns {Promise<void>}
     * @private
     */
    async _addItemsToSearch(api) {
        let passwords = await api
            .getPasswordRepository()
            .clearCache()
            .findAll();

        SearchIndex.addItems(passwords);
    }

    /**
     *
     * @param {Api} api
     * @private
     */
    _removeItemsFromSearch(api) {
        let query = new SearchQuery(),
            items = query
                .where(query.field('server').equals(api.getServer().getId()))
                .execute();

        SearchIndex.removeItems(items);
    }
}

export default new ServerManager();