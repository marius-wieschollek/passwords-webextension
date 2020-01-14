import AbstractController from '@js/Controller/AbstractController';
import RecommendationManager from '@js/Manager/RecommendationManager';
import QueueService from '@js/Services/QueueService';
import TabManager from '@js/Manager/TabManager';
import SystemService from '@js/Services/SystemService';

export default class Status extends AbstractController {

    /**
     *
     * @param {Message} message
     * @param {Message} reply
     */
    async execute(message, reply) {
        let info   = await SystemService.getBrowserInfo(),
            status = {
                currentTab  : 'related',
                suggested   : [],
                search      : {
                    query  : '',
                    results: []
                },
                device      : info.device,
                isAuthorized: this._isAuthorized()
            };

        if(!RecommendationManager.hasRecommendations()) {
            status.currentTab = 'search';
        } else {
            status.suggested = RecommendationManager.getRecommendations();
        }

        if(TabManager.has('search.query') && TabManager.has('search.results')) {
            status.search.query = TabManager.get('search.query');
            status.search.results = TabManager.get('search.results').execute();
        }

        reply
            .setType('popup.data')
            .setPayload(status);
    }

    /**
     *
     * @return {boolean}
     * @private
     */
    _isAuthorized() {
        return !QueueService.hasQueue('authorisation') || !QueueService.getFeedbackQueue('authorisation').hasItems();
    }
}