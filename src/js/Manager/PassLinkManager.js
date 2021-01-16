import SystemService from "@js/Services/SystemService";

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
            {urls: ['https://passlink.mdns.eu/open/*']},
            ['blocking']
        );
    }

    /**
     *
     * @param requestDetails
     * @return {{cancel: boolean}|{redirectUrl: *}}
     * @private
     */
    _redirectRequest(requestDetails) {
        let passlinkUrl = SystemService.getBrowserApi().runtime.getURL('html/passlink.html'),
            eventUrl    = requestDetails.url.replace('https://passlink.mdns.eu/open/', 'ext+passlink:');

        passlinkUrl += '?link=' + encodeURIComponent(eventUrl);
        SystemService.getBrowserApi().tabs.update(requestDetails.tabId, {url: passlinkUrl});

        return {cancel: true};
    }
};