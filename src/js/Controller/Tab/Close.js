import AbstractController from '@js/Controller/AbstractController';
import SystemService from '@js/Services/SystemService';
import TabManager from '@js/Manager/TabManager';
import ErrorManager from '@js/Manager/ErrorManager';

export default class Close extends AbstractController {

    /**
     *
     * @param {Message} message
     * @param {Message} reply
     */
    async execute(message, reply) {
        let api   = SystemService.getBrowserApi(),
            tabId = TabManager.get('id');

        try {
            await api.tabs.remove(tabId);
            reply.setPayload({success: true});
        } catch(e) {
            ErrorManager.logError(e);
            reply.setPayload({success: false});
        }
    }
}