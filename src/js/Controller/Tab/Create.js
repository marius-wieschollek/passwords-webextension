import AbstractController from '@js/Controller/AbstractController';
import SystemService from '@js/Services/SystemService';
import ErrorManager from '@js/Manager/ErrorManager';

export default class Create extends AbstractController {

    /**
     *
     * @param {Message} message
     * @param {Message} reply
     */
    async execute(message, reply) {
        let api   = SystemService.getBrowserApi();

        try {
            let payload = message.getPayload();
            await api.tabs.create({url:payload.url});
            reply.setPayload({success: true});
        } catch(e) {
            ErrorManager.logError(e);
            reply.setPayload({success: false});
        }
    }
}