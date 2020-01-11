import polyfill from 'webextension-polyfill';

class BrowserApi {
    getBrowserApi() {
        return polyfill;
    }

    getContextMenu() {
        return this.getBrowserApi().contextMenus;
    }

    hasContextMenu() {
        return this.getBrowserApi().hasOwnProperty('contextMenus');
    }
}

export default new BrowserApi();