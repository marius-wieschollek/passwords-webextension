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
        let api   = SystemService.getBrowserApi();

        try {
            let tabId = await this.getTabId(message);
            await api.tabs.remove(tabId);
            reply.setPayload({success: true});
        } catch(e) {
            ErrorManager.logError(e);
            reply.setPayload({success: false});
        }
    }

    /**
     *
     * @param {Message} message
     * @return {Promise<void>}
     */
    async getTabId(message) {
        let payload = message.getPayload();

        if(payload === null || !payload.hasOwnProperty('url')) return TabManager.get('id');

        let tabs = await SystemService.getBrowserApi().tabs.query({url: payload.url});
        if(tabs.length === 0) return TabManager.get('id');

        return tabs[0].id;
    }
}