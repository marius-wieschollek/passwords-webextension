import StorageService from '@js/Services/StorageService';
import Server from '@js/Models/Server/Server';
import ServerNotFoundError from "@js/Exception/ServerNotFoundError";
import UuidHelper from "@js/Helper/UuidHelper";
import {emit, subscribe} from "@js/Event/Events";

class ServerRepository {

    get STORAGE_KEY() {
        return 'servers';
    }

    constructor() {
        this._servers = null;

        subscribe('storage:sync', (d) => {this._processSync(d);});
    }

    /**
     *
     * @returns {Server[]}
     * @deprecated Use findAll instead
     */
    list() {
        return this._loadServers();
    }

    /**
     *
     * @returns {Server[]}
     */
    findAll() {
        return this._loadServers();
    }

    /**
     *
     * @returns {Server}
     */
    findById(id) {
        let server = this._findById(id);

        if(!server) {
            throw new ServerNotFoundError(id);
        }

        return server;
    }

    /**
     *
     * @param {Server} server
     */
    async create(server) {
        if(server.getId() === null || server.getId() === undefined) {
            server.setId(UuidHelper.generate());
        }

        await this._saveServer(server);
    }

    /**
     *
     * @param {Server} server
     */
    async update(server) {
        if(server.getId() === null || server.getId() === undefined) {
            return await this.create(server);
        }

        await this._saveServer(server);
    }

    /**
     *
     * @param {Server} server
     */
    async delete(server) {
        let servers = this._loadServers();

        for(let i = 0; i < servers.length; i++) {
            if(servers[i].getId() === server.getId()) {
                servers.splice(i, 1);
                await StorageService.remove(`server.${server.getId()}.token`);
                await StorageService.set(this.STORAGE_KEY, servers, StorageService.STORAGE_SYNC);
                return;
            }
        }
    }

    /**
     *
     * @param {String} id
     * @return {Server|null}
     * @private
     */
    _findById(id) {
        let servers = this._loadServers();

        for(let server of servers) {
            if(server.getId() === id) {
                return server;
            }
        }

        return null;
    }

    /**
     *
     * @returns {Server[]}
     * @private
     */
    _loadServers() {
        if(this._servers !== null) {
            return this._servers;
        }

        let servers = [];
        if(StorageService.has(this.STORAGE_KEY, StorageService.STORAGE_SYNC)) {
            let data = StorageService.get(this.STORAGE_KEY, StorageService.STORAGE_SYNC);

            for(let element of data) {
                let server = this._makeServerFromData(element);
                servers.push(server);
            }
        }

        this._servers = servers;
        return servers;
    }

    /**
     *
     * @param {Object} element
     * @return {Server}
     * @private
     */
    _makeServerFromData(element) {
        if(!element.hasOwnProperty('token')) {
            element.token = StorageService.get(`server.${element.id}.token`, StorageService.STORAGE_SYNC);
        }
        return new Server(element);
    }

    /**
     *
     * @returns {Server[]}
     * @private
     */
    _refreshServers() {
        let servers = [];
        if(StorageService.has(this.STORAGE_KEY, StorageService.STORAGE_SYNC)) {
            let data = StorageService.get(this.STORAGE_KEY, StorageService.STORAGE_SYNC);

            for(let element of data) {
                try {
                    let server = this.findById(element.id);

                    for(let key of element) {
                        if(element.hasOwnProperty(key)) server.setProperty(key, element[key]);
                    }
                } catch(e) {
                    servers.push(new Server(element));
                }
            }
        }

        this._servers = servers;
        return servers;
    }

    /**
     *
     * @param server
     * @returns {Promise<void>}
     * @private
     */
    async _saveServer(server) {
        let servers = this._loadServers();

        for(let i = 0; i < servers.length; i++) {
            if(servers[i].getId() === server.getId()) {
                servers[i] = server;
                await this._saveServerList(servers);
                return;
            }
        }

        servers.push(server);
        await this._saveServerList(servers);
    }

    /**
     *
     * @param {Server[]} servers
     * @return {Promise<void>}
     * @private
     */
    async _saveServerList(servers) {
        let objects = [];

        for(let server of servers) {
            let data = server.getProperties();
            await StorageService.set(`server.${data.id}.token`, data.token, StorageService.STORAGE_SYNC);
            delete data.token;

            objects.push(data);
        }
        await StorageService.set(this.STORAGE_KEY, objects, StorageService.STORAGE_SYNC);
    }

    _processSync(d) {
        let changedServers = [];

        // Servers with changed token
        for(let key in d.changed) {
            if(key.startsWith('server') && key.endsWith('token')) {
                let serverId = key.split('.')[1];
                changedServers.push(serverId);
            }
        }

        // Serves with any kind of change
        if(d.changed.hasOwnProperty(this.STORAGE_KEY)) {
            let servers = d.changed[this.STORAGE_KEY];
            for(let element of servers) {
                let server    = this._findById(element.id),
                    newServer = this._makeServerFromData(element);

                if(!server || JSON.stringify(server.getProperties()) !== JSON.stringify(newServer.getProperties())) {
                    changedServers.push(newServer.getId());
                }
            }
        }

        if(changedServers.length === 0) {
            return;
        }

        let allServers = this._refreshServers(),
            servers    = [];
        for(let server of allServers) {
            if(changedServers.indexOf(server.getId()) !== -1) {
                servers.push(server);
            }
        }

        emit('servers:sync', servers);
    }
}

export default new ServerRepository();