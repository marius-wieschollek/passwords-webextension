import AbstractController from '@js/Controller/AbstractController';
import SystemService from '@js/Services/SystemService';
import RecommendationManager from '@js/Manager/RecommendationManager';
import QueueService from '@js/Services/QueueService';
import RegistryService from '@js/Services/RegistryService';
import ServerRepository from '@js/Repositories/ServerRepository';

export default class Get extends AbstractController {

    async execute(message, reply) {
        let status = {
            tab   : this._getCurrentTab(),
            data  : this._getTabData(),
            status: {
                device    : await this._getDevice(),
                authorized: this._isAuthorized(),
                firstRun  : await this._isFirstRun()
            }
        };

        reply
            .setType('popup.data')
            .setPayload(status);
    }

    _getTabData() {
        if(RegistryService.has('popup.data')) {
            return RegistryService.get('popup.data');
        }

        return {};
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

        return servers.length === 0;
    }
}