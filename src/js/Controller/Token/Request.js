import AbstractController from '@js/Controller/AbstractController';
import ApiRepository from '@js/Repositories/ApiRepository';
import ErrorManager from '@js/Manager/ErrorManager';

export default class Request extends AbstractController {

    async execute(message, reply) {
        let api         = await ApiRepository.findById(message.getPayload().server),
            provider    = message.getPayload().provider,
            authRequest = api.getSessionAuthorization();

        authRequest.setActiveToken(provider);
        let token = authRequest.getActiveToken();
        if(token.requiresRequest()) {
            try {
                await token.sendRequest();
            } catch(e) {
                ErrorManager.logError(e);
                reply.setPayload({success: false, message: e.message});
            }
        }

        reply.setPayload({success: true});
    }
}