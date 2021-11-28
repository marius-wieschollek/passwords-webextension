import StorageService from '@js/Services/StorageService';
import Server from '@js/Models/Server/Server';
import { v4 as uuid } from 'uuid';
import ServerNotFoundError from "@js/Exception/ServerNotFoundError";

class ServerRepository {

    get STORAGE_KEY() {
        return 'servers';
    }

    constructor() {
        this._servers = null;
    }

    /**
     *
     * @returns {Promise<Server[]>}
     * @deprecated Use findAll instead
     */
    list() {
        return this._loadServers();
    }

    /**
     *
     * @returns {Promise<Server[]>}
     */
    findAll() {
        return this._loadServers();
    }

    /**
     *
     * @returns {Promise<Server>}
     */
    async findById(id) {
        let servers = await this._loadServers();

        for(let server of servers) {
            if(server.getId() === id) {
                return server;
            }
        }

        throw new ServerNotFoundError(id);
    }

    /**
     *
     * @param {Server} server
     */
    async create(server) {
        if(server.getId() === null || server.getId() === undefined) {
            server.setId(uuid());
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
        let servers = await this._loadServers();

        for(let i = 0; i < servers.length; i++) {
            if(servers[i].getId() === server.getId()) {
                servers.splice(i, 1);
                await StorageService.set(this.STORAGE_KEY, servers);
                return;
            }
        }
    }

    /**
     *
     * @returns {Promise<Server[]>}
     * @private
     */
    async _loadServers() {
        if(this._servers !== null) {
            return this._servers;
        }

        let servers = [];
        if(await StorageService.has(this.STORAGE_KEY)) {
            let data = await StorageService.get(this.STORAGE_KEY);

            for(let element of data) {
                servers.push(new Server(element));
            }
        }

        this._servers = servers;
        return servers;
    }

    /**
     *
     * @returns {Promise<Server[]>}
     * @private
     */
    async _refreshServers() {
        let servers = [];
        if(await StorageService.has(this.STORAGE_KEY)) {
            let data = await StorageService.get(this.STORAGE_KEY);

            for(let element of data) {
                try {
                    let server = await this.findById(element.id);

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
        let servers = await this._loadServers();

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
            objects.push(server.getProperties());
        }
        await StorageService.set(this.STORAGE_KEY, objects);
    }
}

export default new ServerRepository();