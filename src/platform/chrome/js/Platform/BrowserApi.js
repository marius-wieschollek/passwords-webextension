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
     * @return {Boolean}
     */
    hasBadgeText() {
        return !!this.getBrowserApi().browserAction.getBadgeText;
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
     *
     * @return {Promise<Boolean>}
     */
     requestUpdateCheck() {
        return this.getBrowserApi().runtime.requestUpdateCheck();
    }

    /**
     * @param {String} platform
     * @returns {Boolean}
     */
    isCompatible(platform) {
        return platform === 'chrome';
    }

    usesDarkMode() {
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