import ServerRepository from '@js/Repositories/ServerRepository';
import QueueService from '@js/Services/QueueService';
import AuthorisationItem from '@js/Models/Queue/AuthorisationItem';
import ErrorManager from '@js/Manager/ErrorManager';
import ApiRepository from '@js/Repositories/ApiRepository';
import BooleanState from 'passwords-client/src/State/BooleanState';
import EventQueue from '@js/Event/EventQueue';
import StorageService from '@js/Services/StorageService';

class ServerManager {

    /**
     * @returns {BooleanState}
     */
    get isAuthorized() {
        return this._authState;
    }

    /**
     * @returns {EventQueue}
     */
    get onAddServer() {
        return this._addServer;
    }

    /**
     * @returns {EventQueue}
     */
    get onDeleteServer() {
        return this._deleteServer;
    }

    constructor() {
        this._authQueue = null;
        this._keepaliveTimer = {};
        this._authState = new BooleanState(true);
        this._addServer = new EventQueue();
        this._deleteServer = new EventQueue();
        this._servers = {};
        StorageService.sync.on(
            (d) => {
                this._syncServers(d);
            }
        );
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
            api         = await ApiRepository.findById(serverId),
            authRequest = api.getSessionAuthorization();

        this._servers[serverId] = {server, status: 'login'};
        if(!api.getSession().getAuthorized()) {
            await authRequest.load();

            let authorized = await this._getAuth(authRequest, {
                server   : server.getId(),
                label    : server.getLabel(),
                password : authRequest.requiresChallenge(),
                token    : authRequest.requiresToken(),
                providers: this._getProviderArray(authRequest.getTokens())
            });
            if(!authorized) return;
        }

        this._servers[serverId].status = 'enabled';
        await this._addServer.emit(server);
        this._keepaliveTimer[serverId] = setInterval(() => { this._keepalive(api); }, 59000);
    }

    /**
     *
     * @param {Server} server
     * @returns {Promise<void>}
     */
    async deleteServer(server) {
        let serverId = server.getId();
        clearInterval(this._keepaliveTimer[serverId]);
        delete this._keepaliveTimer[serverId];

        let api = await ApiRepository.findById(server.getId());
        await ApiRepository.delete(api);
        await ServerRepository.delete(server);
        await this._deleteServer.emit(server);
        this._servers[serverId].status = 'deleted';
    }

    /**
     *
     * @return {Promise<Api>}
     */
    async getDefaultApi() {
        // @TODO acutally implement default server setting
        let all = await ApiRepository.findAll();

        return all.pop();
    }

    /**
     *
     * @param {Api} api
     */
    _keepalive(api) {
        api
            .getRequest()
            .setPath('1.0/session/keepalive')
            .send()
            .catch(ErrorManager.catch());
    }

    /**
     *
     * @param {SessionAuthorization} authRequest
     * @param {Object} item
     * @returns {Promise<*>}
     * @private
     */
    async _getAuth(authRequest, item) {
        if(!authRequest.requiresChallenge() && !authRequest.requiresToken()) {
            try {
                await authRequest.authorize();
                return true;
            } catch(e) {
                ErrorManager.logError(e);
            }
        }

        try {
            this._authState.set(false);
            item = await this._authQueue.push(item);
            if(!item.getSuccess() && item.getResult().cancelled) {
                this._authState.set(!this._authQueue.hasItems());
                return false;
            }

            if(authRequest.requiresChallenge()) {
                authRequest.getChallenge().setPassword(item.getPassword());
            }

            if(authRequest.requiresToken()) {
                authRequest.setActiveToken(item.getProvider());
                if(item.getToken()) {
                    authRequest.getActiveToken().setToken(item.getToken());
                }
            }

            await authRequest.authorize();
            await this._authQueue.push(item.setAccepted(true));
            this._authState.set(!this._authQueue.hasItems());

            return true;
        } catch(e) {
            ErrorManager.logError(e);
            item.setAccepted(false).setFeedback(e);

            return await this._getAuth(authRequest, item);
        }
    }

    /**
     *
     * @param {AbstractToken[]} tokens
     * @return {Object[]}
     * @private
     */
    _getProviderArray(tokens) {
        let providers = [];
        for(let token of tokens) {
            providers.push(
                {
                    id         : token.getId(),
                    label      : token.getLabel(),
                    description: token.getDescription(),
                    hasRequest : token.requiresRequest(),
                    hasInput   : token.getType() === 'user-token'
                }
            );
        }

        return providers;
    }

    /**
     *
     * @param d
     * @returns {Promise<void>}
     * @private
     */
    async _syncServers(d) {
        if(!d.hasOwnProperty(ServerRepository.STORAGE_KEY)) return;
        let servers  = await ServerRepository._refreshServers(),
            promises = [],
            ids      = [];

        for(let server of servers) {
            ids.push(server.getId());
            promises.push(this.addServer(server));
        }

        for(let key in this._servers) {
            if(this._servers.hasOwnProperty(key) && ids.indexOf(key) === -1 && this._servers[key].status !== 'deleted') {
                promises.push(this.deleteServer(this._servers[key].server));
            }
        }

        await Promise.all(promises);
        console.log('Reloaded servers after browser sync');
    }
}

export default new ServerManager();