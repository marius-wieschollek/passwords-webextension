import RecommendationManager from '@js/Manager/RecommendationManager';

export default class Related {

    /**
     *
     * @param {Message} message
     * @param {Message} reply
     */
    async execute(message, reply) {
        reply.setType('password.items')
            .setPayload(await RecommendationManager.getRecommendations());
    }
}