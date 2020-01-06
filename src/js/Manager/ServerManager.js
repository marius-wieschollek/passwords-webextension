import ServerRepository from '@js/Repositories/ServerRepository';
import QueueService from '@js/Services/QueueService';
import AuthorisationItem from '@js/Models/Queue/AuthorisationItem';
import ErrorManager from '@js/Manager/ErrorManager';
import SearchIndex from '@js/Search/Index/SearchIndex';

class ServerManager {

    constructor() {
        this._authQueue = null;
    }

    /**
     *
     * @returns {Promise<void>}
     */
    async init() {
        this._authQueue = QueueService.getFeedbackQueue('authorisation', null, AuthorisationItem);
        await this._loadServers()
    }

    /**
     *
     * @returns {Promise<void>}
     * @private
     */
    async _loadServers() {
        let servers = await ServerRepository.findAll(),
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
        let authRequest = server.getSessionAuthorisation();
        await authRequest.load();
        if(authRequest.hasChallenge()) {
            await this._getAuth(authRequest, {
                server  : server.getId(),
                password: authRequest.hasChallenge(),
                token: authRequest.hasToken()
            });
        }

        await this._addItemsToSearch(server);
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
                authRequest.getChallenge().setPassword(item.getPassword())
            }

            if(authRequest.hasToken()) {
                authRequest.getToken().setToken(item.getToken())
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
     */
    async _addItemsToSearch(server) {
        let passwords = await server.getPasswordRepository().findAll();

        SearchIndex.addItems(passwords);
    }
}

export default new ServerManager();