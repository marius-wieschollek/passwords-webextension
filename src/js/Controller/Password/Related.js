import RecommendationManager from '@js/Manager/RecommendationManager';
import AbstractController from '@js/Controller/AbstractController';
import TabManager from "@js/Manager/TabManager";

export default class Related extends AbstractController {

    /**
     *
     * @param {Message} message
     * @param {Message} reply
     */
    async execute(message, reply) {
        let payload = {
            passwords: RecommendationManager.getRecommendations(),
            tab      : TabManager.currentTabId
        };

        reply.setType('password.suggestions')
             .setPayload(payload);
    }
}