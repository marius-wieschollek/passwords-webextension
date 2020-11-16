import AbstractController from '@js/Controller/AbstractController';
import {PassLink} from 'passwords-client';
import ErrorManager from '@js/Manager/ErrorManager';

export default class Analyze extends AbstractController {

    /**
     *
     * @param {Message} message
     * @param {Message} reply
     */
    async execute(message, reply) {
        let link = message.getPayload();

        reply.setType('passlink.link');
        try {
            let info = PassLink.analyzeLink(link);
            reply.setPayload({action: info.action, data: info.parameters});
        } catch(e) {
            reply.setPayload({action: 'error', data: {message: e.message, link}});
            ErrorManager.logError(e);
        }
    }
}