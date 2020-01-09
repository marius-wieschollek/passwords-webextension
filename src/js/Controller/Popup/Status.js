import AbstractController from '@js/Controller/AbstractController';
import RecommendationManager from '@js/Manager/RecommendationManager';
import QueueService from '@js/Services/QueueService';
import TabManager from '@js/Manager/TabManager';

export default class Status extends AbstractController {

    /**
     *
     * @param {Message} message
     * @param {Message} reply
     */
    async execute(message, reply) {
        let status = {
            currentTab  : 'related',
            suggested   : [],
            search      : {
                query  : '',
                results: []
            },
            isAuthorized: true
        };

        if(!RecommendationManager.hasRecommendations()) {
            status.currentTab = 'search';
        } else {
            status.suggested = RecommendationManager.getRecommendations();
        }

        if(QueueService.hasQueue('authorisation') && QueueService.getFeedbackQueue('authorisation').hasItems()) {
            status.isAuthorized = false;
        }

        if(TabManager.has('search.query') && TabManager.has('search.results')) {
            status.search.query = TabManager.get('search.query');
            status.search.results = TabManager.get('search.results').execute();
        }

        reply
            .setType('popup.data')
            .setPayload(status);
    }
}