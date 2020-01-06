import BooleanState from 'passwords-client/src/State/BooleanState';
import polyfill from 'webextension-polyfill';

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
        if(['background', 'popup', 'options', 'content'].indexOf(value) !== -1) {
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

    connect() {
        this._api.runtime.connect();
    }

    /**
     *
     * @returns {Promise<void>}
     * @private
     */
    async _loadBrowserApi() {
        if(process.env.APP_PLATFORM === 'chrome') {
            this._api = polyfill;
        } else {
            this._api = browser;
        }
        this._ready.set(true);
    }
}

export default new SystemService();