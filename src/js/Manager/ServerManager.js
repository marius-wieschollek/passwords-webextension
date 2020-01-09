import ServerRepository from '@js/Repositories/ServerRepository';
import QueueService from '@js/Services/QueueService';
import AuthorisationItem from '@js/Models/Queue/AuthorisationItem';
import ErrorManager from '@js/Manager/ErrorManager';
import SearchIndex from '@js/Search/Index/SearchIndex';
import SearchQuery from '@js/Search/Query/SearchQuery';

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
        let servers  = await ServerRepository.findAll(),
            promises = [];

        for(let server of servers) {
            promises.push(this.addServer(server));
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
            authRequest = server.getSessionAuthorisation();
        await authRequest.load();
        if(authRequest.hasChallenge()) {
            await this._getAuth(authRequest, {
                server  : server.getId(),
                password: authRequest.hasChallenge(),
                token   : authRequest.hasToken()
            });
        }

        this._keepaliveTimer[serverId] = setInterval(() => { this._keepalive(server); }, 59000);
        this._refreshTimer[serverId] = setInterval(() => { this._reloadPasswords(server); }, 900000);

        await this._addItemsToSearch(server);
    }

    /**
     *
     * @param {Server} server
     * @returns {Promise<void>}
     */
    async deleteServer(server) {
        this._removeItemsFromSearch(server);


        let serverId = server.getId();
        clearInterval(this._keepaliveTimer[serverId]);
        delete this._keepaliveTimer[serverId];
        clearInterval(this._refreshTimer[serverId]);
        delete this._refreshTimer[serverId];

        await ServerRepository.delete(server);
    }

    /**
     *
     * @param {Server} server
     */
    _keepalive(server) {
        server
            .createRequest()
            .setPath('api/1.0/session/keepalive')
            .send()
            .catch(ErrorManager.catch());
    }

    /**
     *
     * @param {Server} server
     * @private
     */
    _reloadPasswords(server) {
        this._removeItemsFromSearch(server);
        this._addItemsToSearch(server)
            .catch(ErrorManager.catch());
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
     * @param {Server} server
     * @returns {Promise<void>}
     * @private
     */
    async _addItemsToSearch(server) {
        let passwords = await server
            .getPasswordRepository()
            .clearCache()
            .findAll();

        SearchIndex.addItems(passwords);
    }

    /**
     *
     * @param {Server} server
     * @private
     */
    _removeItemsFromSearch(server) {
        let query = new SearchQuery(),
            items = query
                .where(query.field('server').equals(server.getId()))
                .execute();

        SearchIndex.removeItems(items);
    }
}

export default new ServerManager();