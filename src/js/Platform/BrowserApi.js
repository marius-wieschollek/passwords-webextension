class BrowserApi {

    /**
     *
     * @return {browser}
     */
    getBrowserApi() {
        return browser;
    }

    /**
     *
     * @return {Promise<{name: string, version: string}>}
     */
    async getBrowserInfo() {
        let app    = await browser.runtime.getBrowserInfo(),
            os     = await browser.runtime.getPlatformInfo(),
            device = os.os === 'android' ? 'mobile':'desktop';

        return {
            device,
            os     : os.os,
            arch   : os.arch,
            name   : app.name,
            vendor : app.vendor,
            version: app.version
        };
    }

    /**
     *
     * @return {browser.contextMenus}
     */
    getContextMenu() {
        return browser.menus;
    }

    /**
     *
     * @return {boolean}
     */
    hasContextMenu() {
        return browser.hasOwnProperty('menus');
    }

    /**
     *
     * @return {boolean}
     */
    hasBadgeText() {
        return browser.browserAction.hasOwnProperty('getBadgeText');
    }
}

export default new BrowserApi();