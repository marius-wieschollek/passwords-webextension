import AbstractController from '@js/Controller/AbstractController';
import SystemService from '@js/Services/SystemService';
import TabManager from '@js/Manager/TabManager';

export default class Popout extends AbstractController {

    /**
     *
     * @param {Message} message
     * @param {Message} reply
     */
    async execute(message, reply) {
        let info = await SystemService.getBrowserInfo();
        if(info.device === 'desktop') {
            let id = await this.getTabId(message);
            this.tabToWindow(id);
        }
        reply.setPayload({success: true});
    }

    /**
     *
     * @return {Promise<void>}
     */
    async tabToWindow(tabId) {
        let api    = SystemService.getBrowserApi(),
            parent = await api.windows.getLastFocused({populate: true}),
            offset = {width: 14, height: SystemService.isCompatible('chrome') ? 106:82, left: 25, top: 74},
            width  = 360 + offset.width,
            height = 360 + offset.height,
            left   = Math.floor(parent.left + parent.width - width - offset.left),
            top    = Math.floor(parent.top + offset.top);

        if(parent.tabs.length === 1 && parent.tabs[0].id === tabId) {
            await api.windows.update(info.id, {top, left, width, height, focused: true, drawAttention: true});
            return;
        }

        let info = await api.windows.create({type: 'panel', tabId, top, left, width, height});

        if(SystemService.isCompatible(SystemService.PLATFORM_FIREFOX)) {
            await api.windows.update(info.id, {top, left});
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