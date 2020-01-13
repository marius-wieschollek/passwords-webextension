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
     * @return {Promise<{name: string, version: string}>}
     */
    async getBrowserInfo() {
        let info = await browser.runtime.getBrowserInfo();

        return {
            name   : info.name,
            version: info.version
        };
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