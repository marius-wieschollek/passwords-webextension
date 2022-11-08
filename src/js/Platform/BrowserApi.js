class BrowserApi {

    /**
     * @return {browser}
     */
    getBrowserApi() {
        return browser;
    }

    /**
     * @return {Promise<{os: String, vendor: String, name: String, arch: String, device: String, version: String}>}
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
     * @return {Boolean}
     */
    hasContextMenu() {
        return browser.hasOwnProperty('menus');
    }

    /**
     *
     * @returns {{setBadgeText: {maxArgs: number, fallbackToNoCallback: boolean, minArgs: number}, setIcon: {maxArgs: number, minArgs: number}, setPopup: {maxArgs: number, fallbackToNoCallback: boolean, minArgs: number}, getBadgeText: {maxArgs: number, minArgs: number}, getBadgeBackgroundColor: {maxArgs: number, minArgs: number}, getTitle: {maxArgs: number, minArgs: number}, disable: {maxArgs: number, fallbackToNoCallback: boolean, minArgs: number}, enable: {maxArgs: number, fallbackToNoCallback: boolean, minArgs: number}, openPopup: {maxArgs: number, minArgs: number}, setBadgeBackgroundColor: {maxArgs: number, fallbackToNoCallback: boolean, minArgs: number}, setTitle: {maxArgs: number, fallbackToNoCallback: boolean, minArgs: number}, getPopup: {maxArgs: number, minArgs: number}}}
     */
    getBrowserAction() {
        return browser.browserAction;
    }

    /**
     *
     * @return {Boolean}
     */
    hasBadgeText() {
        return this.getBrowserAction().hasOwnProperty('getBadgeText');
    }

    /**
     *
     * @return {Boolean}
     */
    hasNotificationButtons() {
        return false;
    }

    /**
     * @param {String} platform
     * @returns {Boolean}
     */
    isCompatible(platform) {
        if(platform === 'firefox') return true;
        return platform === process.env.APP_PLATFORM;
    }
}

export default new BrowserApi();