import polyfill from 'webextension-polyfill';
import UaParser from 'ua-parser-js';

class BrowserApi {
    getBrowserApi() {
        return polyfill;
    }

    async getBrowserInfo() {
        let parser = new UaParser(navigator.userAgent),
            app   = parser.getBrowser(),
            os = await this.getBrowserApi().runtime.getPlatformInfo(),
            device = os.os === 'android' ? 'mobile':'desktop';

        return {
            device,
            os     : os.os,
            arch   : os.arch,
            name   : app.name,
            vendor : 'Google',
            version: app.version
        };
    }

    getContextMenu() {
        return this.getBrowserApi().contextMenus;
    }

    hasContextMenu() {
        return this.getBrowserApi().hasOwnProperty('contextMenus');
    }
    /**
     *
     * @return {Boolean}
     */
    hasBadgeText() {
        return this.getBrowserApi().browserAction.hasOwnProperty('getBadgeText');
    }
}

export default new BrowserApi();