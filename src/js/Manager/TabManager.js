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

    get currentTabId() {
        return this._currentTab;
    }

    constructor() {
        this._api = null;
        this._tabs = [];
        this._currentTab = 0;
        this._tabChange = new EventQueue();
        this._urlChange = new EventQueue();

        this._tabEvent = () => {
            this._updateTabInfo()
                .catch(ErrorManager.catch());
        };
    }

    /**
     *
     */
    init() {
        this._api = SystemService.getBrowserApi();

        this._api.tabs.onActivated.addListener(this._tabEvent);
        this._api.tabs.onCreated.addListener(this._tabEvent);
        this._api.tabs.onUpdated.addListener(this._tabEvent);
        this._api.tabs.onReplaced.addListener(this._tabEvent);
        this._api.tabs.onHighlighted.addListener(this._tabEvent);
    }

    /**
     *
     * @param {string} key
     * @param {*} value
     * @param {(number|null)} [tab=null]
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
     * @param {(string|null)} [key=null]
     * @param {(number|null)} [tab=null]
     * @return {*}
     */
    get(key = null, tab = null) {
        if(tab === null) tab = this._currentTab;

        if(!this._tabs.hasOwnProperty(tab) || tab === null) {
            return null;
        }

        if(!key) {
            return this._tabs[tab];
        }

        if(!this._tabs[tab].hasOwnProperty(key)) {
            return null;
        }

        return this._tabs[tab][key];
    }


    /**
     *
     * @param {string} key
     * @param {(number|null)} [tab=null]
     * @return {boolean}
     */
    has(key, tab = null) {
        if(tab === null) tab = this._currentTab;

        return tab !== null && this._tabs.hasOwnProperty(tab) && this._tabs[tab].hasOwnProperty(key);
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
     * @return {Promise<void>}
     * @private
     */
    async _updateTabInfo() {
        let tabs = await this._api.tabs.query({currentWindow: true, active: true});
        if(tabs.length !== 1) {
            this._currentTab = null;
        }

        let tab   = tabs.pop(),
            tabId = tab.id;

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
    }

    /**
     *
     * @param {Array} callbacks
     * @param {Tab} tab
     * @return {Promise<void>}
     * @private
     */
    async _notifyListeners(callbacks, tab) {
        for(let callback of callbacks) {
            try {
                await callback(tab);
            } catch(e) {
                ErrorManager.logError(e);
            }
        }
    }
}

export default new TabManager();