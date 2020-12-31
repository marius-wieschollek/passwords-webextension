import RecommendationManager from '@js/Manager/RecommendationManager';
import AbstractController from '@js/Controller/AbstractController';

export default class Related extends AbstractController {

    /**
     *
     * @param {Message} message
     * @param {Message} reply
     */
    async execute(message, reply) {
        reply.setType('password.items')
            .setPayload(RecommendationManager.getRecommendations());
    }
}