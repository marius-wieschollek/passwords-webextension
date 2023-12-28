import AuthorisationItem from '@js/Models/Queue/AuthorisationItem';
import ErrorManager from '@js/Manager/ErrorManager';
import ServerManager from '@js/Manager/ServerManager';
import ConnectionErrorHelper from '@js/Helper/ConnectionErrorHelper';
import ServerRepository from "@js/Repositories/ServerRepository";

export default class SessionAuthorizationHelper {

    /**
     *
     * @param {PasswordsClient} api
     * @param {FeedbackQueue} authQueue
     */
    constructor(api, authQueue) {
        this._connectionError = new ConnectionErrorHelper();
        this._authQueue = authQueue;
        this._api = api;
    }

    /**
     *
     * @return {Boolean}
     */
    needsAuthorization() {
        return !this._api.isAuthorized();
    }

    /**
     *
     * @return {Promise<Boolean>}
     */
    async authorize() {
        if(!this.needsAuthorization() || await this._tryAuthorization()) {
            let server = this._api.getServer();
            server.setStatus(server.STATUS_AUTHORIZED);
            return true;
        }

        return false;
    }

    /**
     *
     * @return {Promise<Boolean>}
     * @private
     */
    async _tryAuthorization() {
        let authRequest = await this._getAuthRequest();

        if(!authRequest) return false;
        if(await this._tryAutomaticAuth(authRequest)) return true;

        let authItem = this._makeAuthItem(authRequest);
        while(true) {
            let result = await this._tryManualAuth(authRequest, authItem);
            if(result === 0) return true;
            if(result === 2) return false;

            authRequest = await this._getAuthRequest();
            if(!authRequest) {
                await this._authQueue.push(authItem.setAccepted(true));
                return false;
            }
            this._updateAuthItem(authItem, authRequest);
        }
    }

    /**
     *
     * @param {SessionAuthorization} authRequest
     * @return {Promise<Boolean>}
     * @private
     */
    async _tryAutomaticAuth(authRequest) {
        if(!authRequest.requiresChallenge() && !authRequest.requiresToken()) {
            this._updateServerLockableStatus(false);
            try {
                await authRequest.authorize();
                return true;
            } catch(e) {
                await this._processError(e);
            }
        }
        return false;
    }

    /**
     * @return {Promise<(SessionAuthorization|Boolean)>}
     * @private
     */
    async _getAuthRequest() {
        try {
            /** @type {SessionAuthorization} **/
            let authRequest = this._api.getClass('authorization.session');
            await authRequest.load();
            this._api.setInstance('authorization.session', authRequest);

            return authRequest;
        } catch(e) {
            await this._processError(e);
        }

        return false;
    }

    /**
     *
     * @param {SessionAuthorization} authRequest
     * @return {AuthorisationItem}
     * @private
     */
    _makeAuthItem(authRequest) {
        let authItem = new AuthorisationItem();

        return this._updateAuthItem(authItem, authRequest);
    }

    /**
     *
     * @param {AuthorisationItem} authItem
     * @param {SessionAuthorization} authRequest
     * @return {AuthorisationItem}
     * @private
     */
    _updateAuthItem(authItem, authRequest) {
        let providers = this._getTokenProviderArray(authRequest.getTokens());

        return authItem.setTask(
            {
                server  : this._api.getServer().getId(),
                label   : this._api.getServer().getLabel(),
                password: authRequest.requiresChallenge(),
                token   : authRequest.requiresToken(),
                providers
            }
        );
    }

    /**
     *
     * @param {SessionAuthorization} authRequest
     * @param {AuthorisationItem} item
     * @returns {Promise<*>}
     * @private
     */
    async _tryManualAuth(authRequest, item) {
        this._updateServerLockableStatus(true);
        try {
            ServerManager.isAuthorized.set(false);
            await this._authQueue.push(item);
            await this._attemptManualAuth(authRequest, item);

            return 0;
        } catch(e) {
            if(item.getCancelled()) return 2;

            ErrorManager.logError(e);
            item.setAccepted(false).setFeedback(e);
        }
        return 1;
    }

    /**
     *
     * @param {SessionAuthorization} authRequest
     * @param {AuthorisationItem} item
     * @return {Promise<void>}
     * @private
     */
    async _attemptManualAuth(authRequest, item) {
        if(authRequest.requiresChallenge()) {
            authRequest.getChallenge().setPassword(item.getPassword());
        }

        if(authRequest.requiresToken() && item.getToken() && item.getProvider()) {
            authRequest.setActiveToken(item.getProvider());
            authRequest.getActiveToken().setToken(item.getToken());
        }

        await authRequest.authorize();
        await this._authQueue.push(item.setAccepted(true));
    }

    /**
     *
     * @param {AbstractToken[]} tokens
     * @return {Object[]}
     * @private
     */
    _getTokenProviderArray(tokens) {
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
     * @param {Error} error
     * @return {Promise<void>}
     * @private
     */
    _processError(error) {
        return this._connectionError.processError(error, this._api.getServer());
    }

    /**
     *
     * @param {Boolean} state
     * @private
     */
    _updateServerLockableStatus(state) {
        let server = this._api.getServer();

        if(server.getLockable() !== state) {
            server.setLockable(state);
            ServerRepository
                .update(server)
                .catch(ErrorManager.catch);
        }
    }
}