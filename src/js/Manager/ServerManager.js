import ServerRepository from '@js/Repositories/ServerRepository';
import QueueService from '@js/Services/QueueService';
import AuthorisationItem from '@js/Models/Queue/AuthorisationItem';
import ErrorManager from '@js/Manager/ErrorManager';
import ApiRepository from '@js/Repositories/ApiRepository';
import BooleanState from 'passwords-client/src/State/BooleanState';
import EventQueue from '@js/Event/EventQueue';
import StorageService from '@js/Services/StorageService';
import SettingsService from '@js/Services/SettingsService';
import SessionAuthorizationHelper from '@js/Helper/SessionAuthorizationHelper';
import ServerRequirementCheck from '@js/Helper/ServerRequirementCheck';

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
    get onRemoveServer() {
        return this._removeServer;
    }

    /**
     * @returns {EventQueue}
     */
    get onDeleteServer() {
        return this._deleteServer;
    }

    constructor() {
        /** @type {(FeedbackQueue|null)} **/
        this._authQueue = null;
        this._keepaliveTimer = {};
        this._authState = new BooleanState(true);
        this._addServer = new EventQueue();
        this._removeServer = new EventQueue();
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
        }

        await this._addServer.emit(server);
        this._keepaliveTimer[serverId] = setInterval(() => { this._keepalive(api); }, 59000);
    }

    /**
     *
     * @param {Server} server
     * @returns {Promise<void>}
     */
    async removeServer(server) {
        let serverId = server.getId();
        clearInterval(this._keepaliveTimer[serverId]);
        delete this._keepaliveTimer[serverId];
        await this._removeServer.emit(server);
        this._removeAuthItems(server.getId());
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
    async deleteServer(server) {
        await this.removeServer(server);
        let serverId = server.getId(),
            api      = await ApiRepository.findById(server.getId());

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

        await this._deleteServer.emit(server);
    }

    /**
     *
     * @return {Promise<Api>}
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
        /** @type {AuthorisationItem[]} **/
        let items = this._authQueue.getItems();

        for(let item of items) {
            if(item.getServerId() === serverId) {
                this._authQueue.remove(item);
            }
        }
    }

    async _findDefaultApi() {
        let all = await ApiRepository.findAll();
        if(all.length > 0) {
            return all.pop();
        }

        return null;
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
            .catch(ErrorManager.catch);
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
            if(this._servers.hasOwnProperty(key) && ids.indexOf(key) === -1) {
                promises.push(this.deleteServer(this._servers[key].server));
            }
        }

        await Promise.all(promises);
        console.log('Reloaded servers after browser sync');
    }
}

export default new ServerManager();