import ServerRepository from '@js/Repositories/ServerRepository';
import QueueService from '@js/Services/QueueService';
import AuthorisationItem from '@js/Models/Queue/AuthorisationItem';
import ErrorManager from '@js/Manager/ErrorManager';
import ApiRepository from '@js/Repositories/ApiRepository';
import BooleanState from 'passwords-client/boolean-state';
import SettingsService from '@js/Services/SettingsService';
import SessionAuthorizationHelper from '@js/Helper/SessionAuthorizationHelper';
import ServerRequirementCheck from '@js/Helper/ServerRequirementCheck';
import {emitAsync, subscribe} from "@js/Event/Events";
import ToastService from "@js/Services/ToastService";

class ServerManager {

    /**
     * @returns {BooleanState}
     */
    get isAuthorized() {
        return this._authState;
    }

    /**
     *
     */
    constructor() {
        /** @type {(FeedbackQueue|null)} **/
        this._authQueue = null;
        this._authState = new BooleanState(true);
        this._servers = {};
        subscribe('servers:sync', (d) => {this._syncServers(d);});
    }

    /**
     *
     * @returns {Promise<void>}
     */
    async init() {
        this._authQueue = QueueService.getFeedbackQueue('authorisation', null, AuthorisationItem);
        this._loadServers()
            .catch((e) => {
                ErrorManager.logError(e);
                ToastService.error(['ServerManagerLoadError', e.message]);
            });
    }

    /**
     *
     * @returns {Promise<void>}
     * @private
     */
    async _loadServers() {
        let servers  = ServerRepository.findAll(),
            promises = [];

        for(let server of servers) {
            if(server.getEnabled()) promises.push(this.addServer(server));
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
            authHelper  = new SessionAuthorizationHelper(api, this._authQueue),
            checkHelper = new ServerRequirementCheck(api);

        server.setStatus(server.STATUS_UNAUTHORIZED);
        if(!await checkHelper.check(true)) return;
        try {
            let result = await authHelper.authorize();
            this._authState.set(!this._authQueue.hasItems());
            if(!result) return;
        } catch(e) {
            this._authState.set(!this._authQueue.hasItems());
            return;
        }

        this._servers[serverId] = server;
        let setting = await SettingsService.get('server.default');
        if(setting.getValue() === null) {
            setting.setValue(serverId);
            await SettingsService.set(setting);
        } else if(setting.getValue() === serverId) {
            await SettingsService.reload();
        }

        await emitAsync('server:added', server);
    }

    /**
     *
     * @param {Server} server
     * @returns {Promise<void>}
     */
    async removeServer(server) {
        let serverId = server.getId();
        this._removeAuthItems(serverId);

        try {
            let api = await ApiRepository.findById(serverId);
            await ApiRepository.delete(api);
        } catch(e) {}

        if(!this._servers.hasOwnProperty(serverId)) return;
        await emitAsync('server:removed', server);
        delete this._servers[serverId];
    }

    /**
     *
     * @param {Server} server
     * @returns {Promise<void>}
     */
    async reloadServer(server) {
        await this.removeServer(server);
        await this.addServer(server);
    }

    /**
     *
     * @param {Server} server
     * @returns {Promise<void>}
     */
    async restartSession(server) {
        if(server.getStatus() === server.STATUS_UNAUTHORIZED) {
            return ;
        }

        await this.removeServer(server);
        let api = await ApiRepository.findById(server.getId());
        api.renewSession();
        await this.addServer(server);
    }

    /**
     *
     * @param {Server} server
     * @returns {Promise<void>}
     */
    async deleteServer(server) {
        await this.removeServer(server);
        let serverId = server.getId(),
            api      = await ApiRepository.findById(serverId);

        await ApiRepository.delete(api);
        await ServerRepository.delete(server);

        let setting = await SettingsService.get('server.default');
        if(setting.getValue() === serverId) {
            let api = await this._findDefaultApi();
            if(api !== null) {
                setting.setValue(api.getServer().getId());
                await SettingsService.set(setting);
            } else {
                await SettingsService.reset(setting);
            }
        }

        await emitAsync('server:deleted', server);
        await this._deleteServer.emit(server);
    }

    /**
     *
     * @return {Promise<PasswordsClient>}
     */
    async getDefaultApi() {
        try {
            let defaultId = await SettingsService.getValue('server.default');

            return await ApiRepository.findById(defaultId);
        } catch(e) {
            ErrorManager.logError(e);
        }

        let api = await this._findDefaultApi();
        if(api !== null) {
            await SettingsService.set('server.default', api.getServer().getId());

            return api;
        }

        // @TODO use custom error here
        throw new Error('No default configured');
    }

    /**
     *
     * @param {String} serverId
     * @private
     */
    _removeAuthItems(serverId) {
        if(!this._authQueue) return;
        /** @type {AuthorisationItem[]} **/
        let items = this._authQueue.getItems();

        for(let item of items) {
            if(item.getServerId() === serverId) {
                this._authQueue.remove(item);
            }
        }
    }

    /**
     *
     * @return {Promise<PasswordsClient|null>}
     * @private
     */
    async _findDefaultApi() {
        let all = await ApiRepository.findAll();
        if(all.length > 0) {
            return all.pop();
        }

        return null;
    }

    /**
     *
     * @param d
     * @returns {void}
     * @private
     */
    _syncServers(d) {
        let promises = [];
        for(let server of d) {
            promises.push(this.reloadServer(server));
        }

        Promise.all(promises)
               .catch(ErrorManager.catch)
               .then(() => {
                   console.log('Reloaded servers after browser sync', d);
               });
    }
}

export default new ServerManager();