import AuthorisationItem from '@js/Models/Queue/AuthorisationItem';
import ServerAccessError from '@js/Exception/ServerAccessError';
import ErrorManager from '@js/Manager/ErrorManager';
import ServerRepository from '@js/Repositories/ServerRepository';

export default class SessionAuthorizationHelper {

    constructor(api, authQueue) {
        this._authQueue = authQueue;
        this._attempts = 0;
        this._api = api;
    }

    needsAuthorization() {
        return !this._api.getSession().getAuthorized();
    }

    async authorize() {
        if(!this.needsAuthorization() || await this._tryAuthorization()) {
            let server = this._api.getServer();
            server.setStatus(server.STATUS_AUTHORIZED);
            return true;
        }

        return false;
    }

    async _tryAuthorization() {
        let authRequest = await this._getAuthRequest();

        if(await this._tryAutomaticAuth(authRequest)) return true;

        let authItem = this._makeAuthItem(authRequest);
        while(this._attempts < 5) {
            let result = await this._tryManualAuth(authRequest, authItem);
            if(result === 0) return true;
            if(result === 2) return false;

            authRequest = await this._getAuthRequest();
            this._attempts++;
        }

        await this._disableServer();
        this._authQueue.push(authItem.setAccepted(true))
            .catch(ErrorManager.catch);

        throw new Error('test');
    }

    async _disableServer() {
        let server = this._api.getServer();
        server.setEnabled(false);
        server.setStatus(server.STATUS_DISABLED);
        await ServerRepository.update(server);
    }

    /**
     *
     * @param {SessionAuthorization} authRequest
     * @return {Promise<boolean>}
     * @private
     */
    async _tryAutomaticAuth(authRequest) {
        if(!authRequest.requiresChallenge() && !authRequest.requiresToken()) {
            try {
                await authRequest.authorize();
                return true;
            } catch(e) {
                throw new ServerAccessError(e);
            }
        }
        return false;
    }

    /**
     * @return {Promise<SessionAuthorization>}
     * @private
     */
    async _getAuthRequest() {
        try {
            /** @type {SessionAuthorization} **/
            let authRequest = this._api.getClass('authorization.session');
            await authRequest.load();
            return authRequest;
        } catch(e) {
            throw new ServerAccessError(e);
        }
    }

    /**
     *
     * @param {SessionAuthorization} authRequest
     * @return {AuthorisationItem}
     * @private
     */
    _makeAuthItem(authRequest) {
        let providers = this._getTokenProviderArray(authRequest.getTokens());

        return new AuthorisationItem(
            {
                task: {
                    server  : this._api.getServer().getId(),
                    label   : this._api.getServer().getLabel(),
                    password: authRequest.requiresChallenge(),
                    token   : authRequest.requiresToken(),
                    providers
                }
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
        try {
            await this._authQueue.push(item);
            if(!item.getSuccess() && item.getResult().cancelled) {
                return 2;
            }
            await this._attemptManualAuth(authRequest, item);

            return 0;
        } catch(e) {
            ErrorManager.logError(e);
            item.setAccepted(false).setFeedback(e);
            return 1;
        }
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
}