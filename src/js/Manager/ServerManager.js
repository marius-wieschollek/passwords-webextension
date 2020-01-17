import ServerRepository from '@js/Repositories/ServerRepository';
import QueueService from '@js/Services/QueueService';
import AuthorisationItem from '@js/Models/Queue/AuthorisationItem';
import ErrorManager from '@js/Manager/ErrorManager';
import SearchIndex from '@js/Search/Index/SearchIndex';
import SearchQuery from '@js/Search/Query/SearchQuery';
import ApiRepository from '@js/Repositories/ApiRepository';
import BooleanState from 'passwords-client/src/State/BooleanState';

class ServerManager {

    get isAuthorized() {
        return this._authState;
    }

    constructor() {
        this._authQueue = null;
        this._keepaliveTimer = {};
        this._refreshTimer = {};
        this._authState = new BooleanState(true);
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
            authRequest = api.getSessionAuthorization();
        await authRequest.load();
        if(authRequest.requiresChallenge() || authRequest.requiresToken()) {
            await this._getAuth(authRequest, {
                server   : server.getId(),
                label    : server.getLabel(),
                password : authRequest.requiresChallenge(),
                token    : authRequest.requiresToken(),
                providers: this._getProviderArray(authRequest.getTokens())
            });
        }

        this._keepaliveTimer[serverId] = setInterval(() => { this._keepalive(api); }, 59000);
        this._refreshTimer[serverId] = setInterval(() => { this._reloadSearchItems(api); }, 900000);

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
        await this._reloadSearchItems(api);
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
     * @param {Api} api
     * @return {Promise<void>}
     * @private
     */
    async _reloadSearchItems(api) {
        try {
            this._removeItemsFromSearch(api);
            await this._addItemsToSearch(api);
        } catch(e) {
            ErrorManager.logError(e);
        }
    }

    /**
     *
     * @param {SessionAuthorization} authRequest
     * @param {Object} item
     * @returns {Promise<*>}
     * @private
     */
    async _getAuth(authRequest, item) {
        try {
            this._authState.set(false);
            item = await this._authQueue.push(item);

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
        await Promise.all(
            [
                this._addRepositoryToSearch(api.getPasswordRepository()),
                this._addRepositoryToSearch(api.getFolderRepository()),
                this._addRepositoryToSearch(api.getTagRepository())
            ]
        );
    }

    /**
     *
     * @param {(PasswordRepository|FolderRepository|TagRepository)} repository
     * @return {Promise<void>}
     * @private
     */
    async _addRepositoryToSearch(repository) {
        let models = await repository.clearCache().findAll();

        SearchIndex.addItems(models);
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
}

export default new ServerManager();