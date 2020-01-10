import polyfill from 'webextension-polyfill';

class BrowserApi {
    getBrowserApi() {
        return polyfill;
    }

    getContextMenu() {
        return browser.contextMenus;
    }

    hasContextMenu() {
        return browser.hasOwnProperty('contextMenus');
    }
}

export default new BrowserApi();