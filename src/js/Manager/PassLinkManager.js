import SystemService from '@js/Services/SystemService';

export default new class PassLinkManager {

    /**
     *
     */
    constructor() {
        this._beforeRequestListener =
            (d) => { return this._redirectRequest(d); };
    }

    /**
     *
     */
    init() {
        SystemService.getBrowserApi().webRequest.onBeforeRequest.addListener(
            this._beforeRequestListener,
            {urls: ['https://link.passwordsapp.org/open/*']},
            ['blocking']
        );

        SystemService.getBrowserApi().tabs.onCreated.addListener(
            (tab) => {
                if(tab.url && tab.url.substr(0, 35) === 'https://link.passwordsapp.org/open/') {
                    this._processEventUrl(tab.url, tab.id);
                }
            }
        );

        SystemService.getBrowserApi().tabs.onUpdated.addListener(
            (tabId, changeInfo) => {
                if(changeInfo.url && changeInfo.url.substr(0, 35) === 'https://link.passwordsapp.org/open/') {
                    this._processEventUrl(changeInfo.url, tabId);
                }
            }
        );
    }

    /**
     *
     * @param requestDetails
     * @return {{cancel: boolean}|{redirectUrl: *}}
     * @private
     */
    _redirectRequest(requestDetails) {
        this._processEventUrl(requestDetails.url, requestDetails.tabId);
        return {cancel: true};
    }

    _processEventUrl(eventUrl, tabId) {
        let passlinkUrl = SystemService.getBrowserApi().runtime.getURL('html/passlink.html');

        eventUrl = eventUrl.replace('https://link.passwordsapp.org/open/', 'ext+passlink:');

        passlinkUrl += '?link=' + encodeURIComponent(eventUrl);
        SystemService.getBrowserApi().tabs.update(tabId, {url: passlinkUrl});
    }
};