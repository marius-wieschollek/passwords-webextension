import AbstractController from '@js/Controller/AbstractController';
import ThemeRepository from '@js/Repositories/ThemeRepository';
import ErrorManager from '@js/Manager/ErrorManager';

export default class Save extends AbstractController {

    async execute(message, reply) {
        try {
            await ThemeRepository.update(message.getPayload());
            reply.setPayload({success: true});
        } catch(e) {
            ErrorManager.logError(e);
            reply.setType('error').setPayload({success: false, message: e.message});
        }
    }
}