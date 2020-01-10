import Server from '@js/Models/Server/Server';
import ServerRepository from '@js/Repositories/ServerRepository';
import Api from 'passwords-client';

class ApiRepository {

    constructor() {
        this._api = {};
    }

    /**
     *
     * @returns {Promise<Api[]>}
     */
    async findAll() {
        let apis  = await this._loadApis(),
            array = [];

        for(let id in apis) {
            if(apis.hasOwnProperty(id)) {
                array.push(apis[id]);
            }
        }

        return array;
    }

    /**
     *
     * @returns {Promise<Api>}
     */
    async findById(id) {
        let apis = await this._loadApis();

        if(apis.hasOwnProperty(id)) {
            return apis[id];
        }

        // @TODO: Use custom NotFoundError here
        throw new Error('Api not found');
    }

    /**
     *
     * @param {Api} api
     */
    async delete(api) {
        let apis = await this._loadApis();

        if(apis.hasOwnProperty(api.getServer().getId())) {
            delete apis[api.getServer().getId()];
        }
    }

    /**
     *
     * @return {Promise<{Api}>}
     * @private
     */
    async _loadApis() {
        let servers = await ServerRepository.findAll();

        for(let server of servers) {
            if(!this._api.hasOwnProperty(server.getId())) {
                this._api[server.getId()] = new Api(server, {}, {model: {server: Server}});
            }
        }

        return this._api;
    }
}

export default new ApiRepository();