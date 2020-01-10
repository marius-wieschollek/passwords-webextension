class BrowserApi {

    /**
     *
     * @return {browser}
     */
    getBrowserApi() {
        return browser;
    }

    /**
     *
     * @return {browser.contextMenus}
     */
    getContextMenu() {
        return browser.menus;
    }

    /**
     *
     * @return {boolean}
     */
    hasContextMenu() {
        return browser.hasOwnProperty('menus');
    }
}

export default new BrowserApi();