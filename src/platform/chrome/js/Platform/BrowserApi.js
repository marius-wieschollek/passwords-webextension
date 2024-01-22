import polyfill from 'webextension-polyfill';
import UaParser from 'ua-parser-js';

class BrowserApi {

    /**
     * @return {browser}
     */
    getBrowserApi() {
        return polyfill;
    }

    /**
     * @return {Promise<{os: String, vendor: String, name: String, arch: String, device: String, version: String}>}
     */
    async getBrowserInfo() {
        let parser = new UaParser(navigator.userAgent),
            app    = parser.getBrowser(),
            os     = parser.getOS().name.toLowerCase(),
            cpu    = parser.getCPU(),
            arch   = cpu.architecture ? cpu.architecture.toLowerCase():'',
            device = os === 'android' ? 'mobile':'desktop';

        if(device === 'mobile' && app.name !== 'Yandex') {
            app.name = 'Kiwi';
        }

        return {
            device,
            os,
            arch,
            name   : app.name,
            vendor : 'Google',
            version: app.version
        };
    }

    /**
     *
     * @return {browser.contextMenus}
     */
    getContextMenu() {
        return this.getBrowserApi().contextMenus;
    }

    /**
     * @return {Boolean}
     */
    hasContextMenu() {
        return !!this.getBrowserApi().contextMenus;
    }

    /**
     *
     * @returns {{setBadgeText: {maxArgs: number, fallbackToNoCallback: boolean, minArgs: number}, setIcon: {maxArgs: number, minArgs: number}, setPopup: {maxArgs: number, fallbackToNoCallback: boolean, minArgs: number}, getBadgeText: {maxArgs: number, minArgs: number}, getBadgeBackgroundColor: {maxArgs: number, minArgs: number}, getTitle: {maxArgs: number, minArgs: number}, disable: {maxArgs: number, fallbackToNoCallback: boolean, minArgs: number}, enable: {maxArgs: number, fallbackToNoCallback: boolean, minArgs: number}, openPopup: {maxArgs: number, minArgs: number}, setBadgeBackgroundColor: {maxArgs: number, fallbackToNoCallback: boolean, minArgs: number}, setTitle: {maxArgs: number, fallbackToNoCallback: boolean, minArgs: number}, getPopup: {maxArgs: number, minArgs: number}}}
     */
    getBrowserAction() {
        return this.getBrowserApi().action;
    }

    /**
     * @return {Boolean}
     */
    hasBadgeText() {
        return !!this.getBrowserAction().getBadgeText;
    }

    /**
     * @return {Boolean}
     */
    hasNotificationButtons() {
        let parser = new UaParser(navigator.userAgent),
            app    = parser.getBrowser();

        return app.name !== 'Opera';
    }

    /**
     * @param {String} platform
     * @returns {Boolean}
     */
    isCompatible(platform) {
        return platform === 'chrome';
    }

    usesDarkMode() {
        //@TODO find a new way to determine this.
        return false;
        let matcher = window.matchMedia('(prefers-color-scheme: dark)');
        return matcher.matches;
    }

    /**
     * @returns {string}
     */
    getDefaultIcon() {
        let parser = new UaParser(navigator.userAgent),
            app    = parser.getBrowser();

        return `passwords${app.name === 'Edge' ? '-outline':''}${this.usesDarkMode() ? '-light':'-dark'}.png`;
    }
}

export default new BrowserApi();