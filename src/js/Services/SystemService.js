import BooleanState from 'passwords-client/src/State/BooleanState';
import BrowserApi from '@js/Platform/BrowserApi';

class SystemService {

    get AREA_BACKGROUND() {
        return 'background';
    }

    get AREA_OPTIONS() {
        return 'options';
    }

    get AREA_CLIENT() {
        return 'client';
    }

    get AREA_POPUP() {
        return 'popup';
    }

    get AREAS() {
        return [
            this.AREA_BACKGROUND,
            this.AREA_OPTIONS,
            this.AREA_CLIENT,
            this.AREA_POPUP
        ]
    }

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
     * @returns {(String|null)}
     */
    getArea() {
        return this._area;
    }

    /**
     * @param {String} value
     * @returns {SystemService}
     */
    setArea(value) {
        if(this.AREAS.indexOf(value) !== -1) {
            this._area = value;
        }

        return this;
    }

    /**
     * @returns {String}
     */
    getBrowserPlatform() {
        return process.env.APP_PLATFORM;
    }

    /**
     * @return {Promise<{name: string, version: string}>}
     */
    getBrowserInfo() {
        return BrowserApi.getBrowserInfo();
    }

    /**
     * @returns {browser}
     */
    getBrowserApi() {
        return this._api;
    }

    /**
     * @returns {browser.contextMenus}
     */
    getContextMenu() {
        return BrowserApi.getContextMenu();
    }

    /**
     * @returns {browser.contextMenus}
     */
    getExtensionId() {
        return this.getBrowserApi().runtime.id;
    }

    /**
     * @returns {Boolean}
     */
    hasContextMenu() {
        return BrowserApi.hasContextMenu();
    }

    /**
     * @returns {Boolean}
     */
    hasBadge() {
        return BrowserApi.hasBadgeText();
    }

    /**
     * @returns {Boolean}
     */
    hasNotificationButtons() {
        return BrowserApi.hasNotificationButtons();
    }

    /**
     * @returns {Boolean}
     */
    hasNotificationOnShow() {
        return this.getBrowserApi().notifications.hasOwnProperty('onShown');
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