import SystemService from '@js/Services/SystemService';
import ErrorManager from '@js/Manager/ErrorManager';
import EventQueue from '@js/Event/EventQueue';

class TabManager {

    get tabChanged() {
        return this._tabChange;
    }

    get urlChanged() {
        return this._urlChange;
    }

    get tabUpdated() {
        return this._tabUpdate;
    }

    get currentTabId() {
        return this._currentTab;
    }

    constructor() {
        this._api = null;
        this._tabs = [];
        this._currentTab = 0;
        this._tabChange = new EventQueue();
        this._urlChange = new EventQueue();
        this._tabUpdate = new EventQueue();

        this._updatedEvent = (tabId, changeInfo, tab) => {
            this._updateTabInfo(tab)
                .catch(ErrorManager.catch());
        };
        this._createdEvent = (tab) => {
            this._updateTabInfo(tab)
                .catch(ErrorManager.catch());
        };
        this._refreshEvent = () => {
            this._updateTabInfo()
                .catch(ErrorManager.catch());
        };
    }

    /**
     *
     */
    init() {
        this._api = SystemService.getBrowserApi();

        this._api.tabs.onActivated.addListener(this._refreshEvent);
        this._api.tabs.onAttached.addListener(this._refreshEvent);
        this._api.tabs.onCreated.addListener(this._createdEvent);
        this._api.tabs.onUpdated.addListener(this._updatedEvent);
        this._api.tabs.onReplaced.addListener(this._refreshEvent);
        this._api.tabs.onHighlighted.addListener(this._refreshEvent);
        if(this._api.windows) {
            this._api.windows.onCreated.addListener(this._refreshEvent);
            this._api.windows.onRemoved.addListener(this._refreshEvent);
            this._api.windows.onFocusChanged.addListener(this._refreshEvent);
        }
        this._updateTabInfo().catch(ErrorManager.catch());
    }

    /**
     *
     * @param {String} key
     * @param {*} value
     * @param {(Number|null)} [tab=null]
     */
    set(key, value, tab = null) {
        if(tab === null) tab = this._currentTab;

        if(!this._tabs.hasOwnProperty(tab) || tab === null) {
            return;
        }

        this._tabs[tab][key] = value;
    }

    /**
     *
     * @param {(String|null)} [key=null]
     * @param {(*|null)} [fallback=null]
     * @param {(Number|null)} [tab=null]
     * @return {*}
     */
    get(key = null, fallback = null, tab = null) {
        if(tab === null) tab = this._currentTab;

        if(!this._tabs.hasOwnProperty(tab) || tab === null) {
            return fallback;
        }

        if(!key) {
            return this._tabs[tab];
        }

        if(!this._tabs[tab].hasOwnProperty(key)) {
            return fallback;
        }

        return this._tabs[tab][key];
    }


    /**
     *
     * @param {String} key
     * @param {(Number|null)} [tab=null]
     * @return {Boolean}
     */
    has(key, tab = null) {
        if(tab === null) tab = this._currentTab;

        return tab !== null && this._tabs.hasOwnProperty(tab) && this._tabs[tab].hasOwnProperty(key);
    }

    /**
     *
     * @param {(String|null)} [key=null]
     * @param {(Number|null)} [tab=null]
     * @return {*}
     */
    remove(key = null, tab = null) {
        if(tab === null) tab = this._currentTab;
        if(!this._tabs.hasOwnProperty(tab) || tab === null) return;

        if(!key) {
            this._tabs[tab] = {
                id     : tab,
                lastUrl: 'about:blank'
            };
            return;
        }

        if(this._tabs[tab].hasOwnProperty(key)) {
            delete this._tabs[tab][key];
        }
    }

    /**
     *
     * @return {Object[]}
     */
    getAll() {
        return this._tabs;
    }

    /**
     *
     * @param {browser.tabs.Tab} [tab]
     * @return {Promise<void>}
     * @private
     */
    async _updateTabInfo(tab) {
        if(!tab) tab = await this._getCurrentTab();
        if(!tab || !tab.active) return;
        let tabId = tab.id;

        if(!this._tabs.hasOwnProperty(tabId)) {
            this._tabs[tabId] = {
                id     : tabId,
                lastUrl: 'about:blank'
            };
        }

        this._tabs[tabId].tab = tab;
        this._tabs[tabId].url = tab.url;

        if(this._currentTab !== tabId) {
            this._currentTab = tabId;
            await this._tabChange.emit(this._tabs[tabId]);
        }

        if(this._tabs[tabId].lastUrl !== tab.url) {
            await this._urlChange.emit(this._tabs[tabId]);
            this._tabs[tabId].lastUrl = tab.url;
        }

        await this._tabUpdate.emit(this._tabs[tabId]);
    }

    /**
     *
     * @return {Promise<void|browser.tabs.Tab>}
     * @private
     */
    async _getCurrentTab() {
        let tabs = await this._api.tabs.query({currentWindow: true, active: true});
        if(tabs.length !== 1) {
            this._currentTab = null;
        }

        return tabs.pop();
    }
}

export default new TabManager();