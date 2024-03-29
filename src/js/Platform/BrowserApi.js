import SystemService from "@js/Services/SystemService";

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
     * @return {Boolean}
     */
    hasBadgeText() {
        return browser.browserAction.hasOwnProperty('getBadgeText');
    }

    /**
     *
     * @return {Boolean}
     */
    hasNotificationButtons() {
        return false;
    }

    /**
     *
     * @return {Promise<Boolean>}
     */
    async requestUpdateCheck() {
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

    /**
     * @returns {boolean}
     */
    usesDarkMode() {
        let matcher = window.matchMedia('(prefers-color-scheme: dark)');
        return matcher.matches;
    }

    /**
     * @returns {string}
     */
    getDefaultIcon() {
        return `passwords${SystemService.usesDarkMode() ? '-light':'-dark'}.svg`;
    }
}

export default new BrowserApi();