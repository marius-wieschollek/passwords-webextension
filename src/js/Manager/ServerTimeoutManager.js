import ErrorManager from '@js/Manager/ErrorManager';
import ApiRepository from '@js/Repositories/ApiRepository';
import ServerManager from '@js/Manager/ServerManager';
import MessageService from '@js/Services/MessageService';
import BrowserApi from "@js/Platform/BrowserApi";
import {subscribe} from "@js/Event/Events";
import ConnectionErrorHelper from "@js/Helper/ConnectionErrorHelper";

export default new class ServerTimeoutManager {

    constructor() {
        this._initialized = false;
        this._keepaliveTimers = {};
        this._connectionError = new ConnectionErrorHelper();
    }

    init() {
        if(this._initialized === false) {
            BrowserApi.getBrowserApi().alarms.create('passwords.server.keepalive', {delayInMinutes: 1, periodInMinutes: 1});
            BrowserApi.getBrowserApi().alarms.onAlarm.addListener((alarm) => {
                if(alarm.name === 'passwords.server.keepalive') {
                    this._checkAllClientTimeouts()
                        .catch(ErrorManager.catch);
                }
            });

            this._lastInteraction = Date.now();
            this._setUpActivityTriggers();
        }

        subscribe('server:added', async (s) => { await this._addServerKeepaliveRequests(s); });
        subscribe('server:removed', (s) => { this._removeServerKeepaliveRequests(s); });
        subscribe('server:deleted', (s) => { this._removeServerKeepaliveRequests(s); });

        subscribe('energy:suspend:resume', () => {
            this._checkAllClientTimeouts()
                .catch(ErrorManager.catch);
        });
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
                    if(e.name === 'PreconditionFailedError' || e.name === 'TooManyRequestsError') {
                        ServerManager
                            .restartSession(server)
                            .catch(ErrorManager.catch);
                    } else if(e.name === 'UnauthorizedError') {
                        this._connectionError
                            .processError(e, server)
                            .catch(ErrorManager.catch);
                    }
                });
    }

    _removeServerKeepaliveRequests(server) {
        if(this._keepaliveTimers.hasOwnProperty(server.getId())) {
            BrowserApi.getBrowserApi().alarms.onAlarm.removeListener(this._keepaliveTimers[server.getId()]);
            delete this._keepaliveTimers[server.getId()];
        }
    }

    async _addServerKeepaliveRequests(server) {
        let api                = await ApiRepository.findById(server.getId()),
            settingsRepository = /** @type {SettingRepository} **/ api.getInstance('repository.setting'),
            settings           = await settingsRepository.findByName('user.session.lifetime'),
            serverLifetime     = settings.has('user.session.lifetime') ? settings.get('user.session.lifetime').getValue():600,
            lifetime           = Math.max(1, (serverLifetime / 60) - 1);


        let alarmName = `passwords.server.keepalive.${server.getId()}`,
            listener  = (alarm) => {
                if(alarm.name === alarmName) {this._keepalive(server);}
            };
        BrowserApi.getBrowserApi().alarms.create(alarmName, {delayInMinutes: lifetime, periodInMinutes: lifetime});
        BrowserApi.getBrowserApi().alarms.onAlarm.addListener(listener);

        this._keepaliveTimers[server.getId()] = listener;
    }
};