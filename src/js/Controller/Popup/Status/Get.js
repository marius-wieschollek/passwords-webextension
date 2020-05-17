import AbstractController from '@js/Controller/AbstractController';
import SystemService from '@js/Services/SystemService';
import RecommendationManager from '@js/Manager/RecommendationManager';
import QueueService from '@js/Services/QueueService';
import RegistryService from '@js/Services/RegistryService';
import ServerRepository from '@js/Repositories/ServerRepository';

export default class Get extends AbstractController {

    async execute(message, reply) {
        let status = {
            tab       : this._getCurrentTab(),
            search    : this._getSearchStatus(),
            browse    : this._getBrowseStatus(),
            collected : this._getCollectedStatus(),
            device    : await this._getDevice(),
            authorized: this._isAuthorized(),
            firstRun: await this._isFirstRun()
        };

        reply
            .setType('popup.data')
            .setPayload(status);
    }

    /**
     *
     * @returns {{query: string}}
     * @private
     */
    _getSearchStatus() {
        if(RegistryService.has('popup.search.status')) {
            return RegistryService.get('popup.search.status');
        }

        return {
            query: ''
        };
    }

    /**
     *
     * @returns {{server: (null|String), info: (null|Boolean), folder: (null|String)}}
     * @private
     */
    _getBrowseStatus() {
        if(RegistryService.has('popup.browse.status')) {
            return RegistryService.get('popup.browse.status');
        }

        return {
            server: null,
            info  : false,
            folder: null
        };
    }

    /**
     *
     * @returns {{current: (null|String)}}
     * @private
     */
    _getCollectedStatus() {
        if(RegistryService.has('popup.collected.status')) {
            return RegistryService.get('popup.collected.status');
        }

        return {
            current: null
        };
    }

    /**
     *
     * @return {Boolean}
     * @private
     */
    _isAuthorized() {
        return !QueueService.hasQueue('authorisation') || !QueueService.getFeedbackQueue('authorisation').hasItems();
    }

    /**
     *
     * @returns {Promise<{String}>}
     * @private
     */
    async _getDevice() {
        let info = await SystemService.getBrowserInfo();

        return info.device;
    }

    /**
     *
     * @returns {string|*}
     * @private
     */
    _getCurrentTab() {
        if(RegistryService.has('popup.tab')) {
            return RegistryService.get('popup.tab');
        }

        if(RecommendationManager.hasRecommendations()) {
            return 'related';
        }

        return 'search';
    }

    /**
     *
     * @return {Promise<Boolean>}
     * @private
     */
    async _isFirstRun() {
        let servers = await ServerRepository.findAll();

        return servers.length === 0
    }
}