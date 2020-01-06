import StorageService from '@js/Services/StorageService';
import Server from '@js/Models/Server/Server';
import uuid from 'uuidv4';

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
     * @returns {Promise<Server|null>}
     */
    async findById(id) {
        let servers = await this._loadServers();

        for(let server of servers) {
            if(server.getId() === id) {
                return server;
            }
        }

        // @TODO: Use custom NotFoundError here
        throw new Error('Server not found');
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
    async delete(server) {
        let servers = await this._loadServers();

        for(let i = 0; i < servers.length; i++) {
            if(servers[i].getId() === server.getId()) {
                servers.splice(i,1);
                await StorageService.set(this.STORAGE_KEY, JSON.stringify(servers));
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
            let data = JSON.parse(await StorageService.get(this.STORAGE_KEY));

            for(let key in data) {
                if(!data.hasOwnProperty(key)) continue;
                servers.push(new Server(data[key]));
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
                await StorageService.set(this.STORAGE_KEY, JSON.stringify(servers));
                return;
            }
        }

        servers.push(server);
        await StorageService.set(this.STORAGE_KEY, JSON.stringify(servers));
    }
}

export default new ServerRepository();