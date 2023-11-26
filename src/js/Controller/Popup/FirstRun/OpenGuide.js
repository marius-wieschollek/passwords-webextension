import AbstractController from "@js/Controller/AbstractController";
import SystemService from "@js/Services/SystemService";
import ErrorManager from "@js/Manager/ErrorManager";

export default class OpenGuide extends AbstractController {

    /**
     *
     * @param {Message} message
     * @param {Message} reply
     */
    async execute(message, reply) {
        let api = SystemService.getBrowserApi(),
            url = await this._getGuideUrl();

        try {
            let payload = message.getPayload();
            await api.tabs.create({url});
            reply.setPayload({success: true});
        } catch(e) {
            ErrorManager.logError(e);
            reply.setPayload({success: false});
        }
    }

    async _getGuideUrl() {
        let browser = await SystemService.getBrowserInfo();

        debugger;
        if(browser.name === 'Firefox') {
            return 'https://git.mdns.eu/nextcloud/passwords-webextension/-/wikis/setup-firefox-desktop';
        }
        if(browser.name === 'Chrome') {
            return 'https://git.mdns.eu/nextcloud/passwords-webextension/-/wikis/setup-chrome-desktop';
        }
        if(browser.name === 'Edge') {
            return 'https://git.mdns.eu/nextcloud/passwords-webextension/-/wikis/home#extension-setup';
        }

        return 'https://git.mdns.eu/nextcloud/passwords-webextension/-/wikis/home#extension-setup';
    }
}