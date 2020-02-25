import AuthorisationItem from '@js/Models/Queue/AuthorisationItem';
import ErrorManager from '@js/Manager/ErrorManager';
import ServerRepository from '@js/Repositories/ServerRepository';
import ToastService from '@js/Services/ToastService';
import HttpError from 'passwords-client/src/Exception/Http/HttpError';
import NetworkError from 'passwords-client/src/Exception/NetworkError';
import UnauthorizedError from 'passwords-client/src/Exception/Http/UnauthorizedError';

export default class SessionAuthorizationHelper {

    /**
     *
     * @param {Api} api
     * @param {FeedbackQueue} authQueue
     */
    constructor(api, authQueue) {
        this._authQueue = authQueue;
        this._api = api;
    }

    /**
     *
     * @return {Boolean}
     */
    needsAuthorization() {
        return !this._api.getSession().getAuthorized();
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
            if(!authRequest) return false;
        }
    }

    /**
     *
     * @return {Promise<void>}
     * @private
     */
    async _disableServer() {
        let server = this._api.getServer();
        server.setEnabled(false);
        server.setStatus(server.STATUS_DISABLED);
        await ServerRepository.update(server);
    }

    /**
     *
     * @param {SessionAuthorization} authRequest
     * @return {Promise<Boolean>}
     * @private
     */
    async _tryAutomaticAuth(authRequest) {
        if(!authRequest.requiresChallenge() && !authRequest.requiresToken()) {
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
            await this._processError(e);
            if(!this._api.getServer().getEnabled()) {
                this._authQueue.push(item.setAccepted(true))
                    .catch(ErrorManager.catch);
                return 2;
            } else {
                item.setAccepted(false).setFeedback(e);
            }
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
    async _processError(error) {
        ErrorManager.logError(error);
        let title = 'Could not connect to ' + this._api.getServer().getLabel(),
            text  = 'Unknown Error';

        if(error instanceof UnauthorizedError) {
            text = 'Server credentials rejected. Please update login data in the settings';

            try {
                await this._disableServer();
            } catch(e) {
                ErrorManager.logError(e);
            }
        } else if(error instanceof HttpError) {
            text = 'HTTP connection error: ' + error.message;
        } else if(error instanceof TypeError && error.message.substr(0, 12) === 'NetworkError') {
            text = 'Network error. Please check if you\'re online and the server is reachable';
        } else if(error instanceof Error) {
            text = error.message;
        }

        ToastService.error(text, title).catch(ErrorManager.catch);
    }
}