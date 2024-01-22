import Server from '@js/Models/Server/Server';
import ServerRepository from '@js/Repositories/ServerRepository';
import PasswordsClient from 'passwords-client';
import EnhancedClassLoader from 'passwords-client/enhanced-class-loader';
import SystemService from '@js/Services/SystemService';
import ErrorManager from "@js/Manager/ErrorManager";

/**
 * @typedef {PasswordsClient} PasswordsClient
 */
class ApiRepository {

    constructor() {
        this._api = {};
    }

    /**
     *
     * @returns {Promise<PasswordsClient[]>}
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
     * @returns {Promise<PasswordsClient>}
     */
    async findById(id) {
        let apis = await this._loadApis();

        if(apis.hasOwnProperty(id)) {
            return apis[id];
        }

        // @TODO: Use custom NotFoundError here
        throw new Error('PasswordsClient not found');
    }

    /**
     *
     * @param {PasswordsClient} api
     */
    delete(api) {
        if(this._api.hasOwnProperty(api.getServer().getId())) {
            if(api.getSession().getAuthorized()) {
                api.getRequest()
                   .setPath('1.0/session/close')
                   .send()
                   .catch(ErrorManager.catch);
            }

            delete this._api[api.getServer().getId()];
        }
    }

    /**
     *
     * @return {Promise<{PasswordsClient}>}
     * @private
     */
    async _loadApis() {
        let servers = ServerRepository.findAll(),
            config  = await this._getApiConfig();

        for(let server of servers) {
            if(!this._api.hasOwnProperty(server.getId())) {
                let classes = new EnhancedClassLoader({'model.server': Server, 'logger': ErrorManager});
                this._api[server.getId()] = new PasswordsClient(server, config, classes);
            }
        }

        return this._api;
    }

    /**
     *
     * @return {Promise<{userAgent: String}>}
     * @private
     */
    async _getApiConfig() {
        return {
            userAgent: await SystemService.getUserAgent()
        };
    }
}

export default new ApiRepository();