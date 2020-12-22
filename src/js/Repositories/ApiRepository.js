import Server from '@js/Models/Server/Server';
import ServerRepository from '@js/Repositories/ServerRepository';
import {EnhancedClassLoader, PasswordsClient} from 'passwords-client';
import SystemService from '@js/Services/SystemService';
import LocalisationService from '@js/Services/LocalisationService';

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
    async delete(api) {
        let apis = await this._loadApis();

        if(apis.hasOwnProperty(api.getServer().getId())) {
            delete apis[api.getServer().getId()];
        }
    }

    /**
     *
     * @return {Promise<{PasswordsClient}>}
     * @private
     */
    async _loadApis() {
        let servers = await ServerRepository.findAll(),
            config  = await this._getApiConfig();

        for(let server of servers) {
            if(!this._api.hasOwnProperty(server.getId())) {
                let classes = new EnhancedClassLoader({'model.server': Server});
                this._api[server.getId()] = new PasswordsClient(server, config, classes);
            }
        }

        return this._api;
    }

    /**
     *
     * @return {Promise<{userAgent: string}>}
     * @private
     */
    async _getApiConfig() {
        let bwInfo = await SystemService.getBrowserInfo(),
            osInfo = await SystemService.getBrowserApi().runtime.getPlatformInfo(),
            os     = osInfo.os ? `${osInfo.os[0].toUpperCase()}${osInfo.os.substr(1)}`:'';

        return {
            userAgent: LocalisationService.translate('UserAgent', [bwInfo.name, os])
        };
    }
}

export default new ApiRepository();