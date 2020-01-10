import BooleanState from 'passwords-client/src/State/BooleanState';
import BrowserApi from '@js/Platform/BrowserApi';

class SystemService {

    constructor() {
        this._api = null;
        this._area = null;
        this._ready = new BooleanState(false);
        this._loadBrowserApi();
    }

    waitReady() {
        return this._ready.awaitTrue();
    }

    /**
     *
     * @returns {string|null}
     */
    getArea() {
        return this._area;
    }

    /**
     *
     * @param {string} value
     * @returns {SystemService}
     */
    setArea(value) {
        if(['background', 'popup', 'options', 'client'].indexOf(value) !== -1) {
            this._area = value;
        }

        return this;
    }

    /**
     *
     * @returns {string}
     */
    getBrowserPlatform() {
        return process.env.APP_PLATFORM;
    }

    /**
     *
     * @returns {browser}
     */
    getBrowserApi() {
        return this._api;
    }

    /**
     *
     * @returns {browser.contextMenus}
     */
    getContextMenu() {
        return BrowserApi.getContextMenu();
    }

    /**
     *
     * @returns {boolean}
     */
    hasContextMenu() {
        return BrowserApi.hasContextMenu();
    }

    /**
     *
     */
    connect() {
        this._api.runtime.connect();
    }

    /**
     *
     * @returns {Promise<void>}
     * @private
     */
    async _loadBrowserApi() {
        this._api = BrowserApi.getBrowserApi();
        this._ready.set(true);
    }
}

export default new SystemService();