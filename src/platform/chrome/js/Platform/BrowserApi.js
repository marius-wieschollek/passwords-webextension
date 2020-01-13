import polyfill from 'webextension-polyfill';
import UaParser from 'ua-parser-js';

class BrowserApi {
    getBrowserApi() {
        return polyfill;
    }

    async getBrowserInfo() {
        let parser = new UaParser(navigator.userAgent),
            info   = parser.getBrowser();

        return {
            name   : info.name,
            version: info.version
        };
    }

    getContextMenu() {
        return this.getBrowserApi().contextMenus;
    }

    hasContextMenu() {
        return this.getBrowserApi().hasOwnProperty('contextMenus');
    }
}

export default new BrowserApi();