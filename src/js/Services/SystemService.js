import BooleanState from 'passwords-client/boolean-state';
import BrowserApi from '@js/Platform/BrowserApi';

class SystemService {

    get AREA_BACKGROUND() {
        return 'background';
    }

    get AREA_PASSLINK() {
        return 'passlink';
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
            this.AREA_PASSLINK,
            this.AREA_OPTIONS,
            this.AREA_CLIENT,
            this.AREA_POPUP
        ];
    }

    get PLATFORM_CHROME() {
        return 'chrome';
    }

    get PLATFORM_FIREFOX() {
        return 'firefox';
    }

    get PLATFORM_FENIX() {
        return 'fenix';
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
     * @param {String} platform
     * @returns {Boolean}
     */
    isCompatible(platform) {
        return BrowserApi.isCompatible(platform);
    }

    /**
     *
     * @return {Promise<{os: String, vendor: String, name: String, arch: String, device: String, version: String}>}
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
     * @param {String} path
     * @return {Promise<String>}
     */
    async getFileUrl(path) {
        return await this.getBrowserApi().runtime.getURL(path);
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
    usesDarkMode() {
        return BrowserApi.usesDarkMode();
    }

    /**
     * @returns {String}
     */
    getDefaultIcon() {
        return BrowserApi.getDefaultIcon();
    }

    /**
     * @returns {Boolean}
     */
    hasNotificationButtons() {
        return BrowserApi.hasNotificationButtons();
    }

    /**
     * @returns {Promise<Boolean>}
     */
    requestUpdateCheck() {
        return BrowserApi.requestUpdateCheck();
    }

    /**
     * @returns {Boolean}
     */
    hasNotificationOnShow() {
        return this.getBrowserApi().notifications.hasOwnProperty('onShown');
    }

    /**
     * @returns {Promise<String>}
     */
    async getUserAgent() {
        let bwInfo = await this.getBrowserInfo(),
            os     = bwInfo.os ? `${bwInfo.os[0].toUpperCase()}${bwInfo.os.substring(1)}`:'';

        return this._api.i18n.getMessage('UserAgent', [bwInfo.name, os]).replace(/[^\x00-\x7F]/g,'_');
    }

    /**
     *
     */
    connect() {
        this._api.runtime.connect(
            this.getExtensionId(),
            {name: this.getArea()}
        );
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