import AbstractController from '@js/Controller/AbstractController';
import {PassLink} from 'passwords-client';
import ErrorManager from '@js/Manager/ErrorManager';
import RegistryService from '@js/Services/RegistryService';

export default class Action extends AbstractController {

    /**
     *
     * @param {Message} message
     * @param {Message} reply
     */
    async execute(message, reply) {
        let {action, data} = message.getPayload();

        try {
            let handler = PassLink.getAction(action, data);

            if(!RegistryService.has(`passlink.action.${action}`) || RegistryService.get(`passlink.action.${action}`).getParameter('id') !== handler.getParameter('id')) {
                RegistryService.set(`passlink.action.${action}`, handler);
            }

            reply.setPayload({success: true});
        } catch(e) {
            ErrorManager.logError(e);
            reply.setPayload({success: false, message: e.message});
        }
    }
}