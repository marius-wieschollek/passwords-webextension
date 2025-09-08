import ErrorManager from '@js/Manager/ErrorManager';
import ApiRepository from '@js/Repositories/ApiRepository';
import ServerManager from '@js/Manager/ServerManager';
import MessageService from '@js/Services/MessageService';
import {subscribe} from "@js/Event/Events";

export default new class ServerTimeoutManager {

    constructor() {
        this._interval = null;
        this._keepaliveTimers = {};
    }

    init() {
        if(this._interval === null) {
            this._interval = setInterval(() => {
                this._checkAllClientTimeouts()
                    .catch(ErrorManager.catch);
            }, 60 * 1000);
            this._lastInteraction = Date.now();
            this._setUpActivityTriggers();
        }

        ServerManager.onAddServer.on(async (server) => {
            await this._addServerKeepaliveRequests(server);
        });

        ServerManager.onRemoveServer.on(async (server) => {
            this._removeServerKeepaliveRequests(server);
        });

        ServerManager.onDeleteServer.on(async (server) => {
            this._removeServerKeepaliveRequests(server);
        });

        subscribe('energy:suspend:resume', () => {
            this._checkAllClientTimeouts()
                .catch(ErrorManager.catch);
        })
    }

    trigger() {
        this._lastInteraction = Date.now();
    }

    /**
     * @returns {Promise<void>}
     * @private
     */
    async _checkAllClientTimeouts() {
        let clients = await ApiRepository.findAll();

        for(let client of clients) {
            this._checkClientTimeout(client)
                .catch(ErrorManager.catch);
        }
    }

    /**
     *
     * @param {PasswordsClient} client
     * @returns {Promise<void>}
     * @private
     */
    async _checkClientTimeout(client) {
        let server = client.getServer();

        if(server.getEnabled() && server.getLockable() && server.getStatus() === server.STATUS_AUTHORIZED && server.getTimeout() > 0) {
            if(Date.now() - this._lastInteraction >= server.getTimeout()) {
                ServerManager
                    .restartSession(server)
                    .catch(ErrorManager.catch);
            }
        }
    }

    _setUpActivityTriggers() {
        MessageService.listen(
            ['popup.status.get', 'popup.status.set', 'options.status', 'setting.set', 'setting.get'],
            async (message, reply) => {
                this.trigger();
            }
        );
    }

    /**
     *
     * @param {Server} server
     */
    async _keepalive(server) {
        let api;
        try {
            api = await ApiRepository.findById(server.getId());
        } catch(e) {
            this._removeServerKeepaliveRequests(server);
            ErrorManager.error(e);
            return;
        }

        if(api.getServer().getStatus() !== server.STATUS_AUTHORIZED) {
            this._removeServerKeepaliveRequests(server);
            ErrorManager.info('Server not authorized when keepalive action called', server);
            return;
        }

        if(server.getTimeout() > 0 && Date.now() - this._lastInteraction >= server.getTimeout()) {
            ErrorManager.info('Server session timed out when keepalive action called', server);
            ServerManager
                .restartSession(server)
                .catch(ErrorManager.catch);
            return;
        }

        api
            .getRequest()
            .setPath('1.0/session/keepalive')
            .send()
            .catch(
                (e) => {
                    ErrorManager.logError(e);
                    if(e.type === 'PreconditionFailedError') {
                        ServerManager
                            .restartSession(server)
                            .catch(ErrorManager.catch);
                    }
                });
    }

    _removeServerKeepaliveRequests(server) {
        if(this._keepaliveTimers.hasOwnProperty(server.getId())) {
            clearInterval(this._keepaliveTimers[server.getId()]);
            delete this._keepaliveTimers[server.getId()];
        }
    }

    async _addServerKeepaliveRequests(server) {
        let api                = await ApiRepository.findById(server.getId()),
            settingsRepository = /** @type {SettingRepository} **/ api.getInstance('repository.setting'),
            settings           = await settingsRepository.findByName('user.session.lifetime'),
            serverLifetime     = settings.has('user.session.lifetime') ? settings.get('user.session.lifetime').getValue():600,
            lifetime           = (serverLifetime * 1000) - 2000;

        this._keepaliveTimers[server.getId()] = setInterval(() => { this._keepalive(server); }, lifetime - 2000);
    }
};