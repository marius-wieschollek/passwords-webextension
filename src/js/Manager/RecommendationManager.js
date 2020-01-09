import SystemService from '@js/Services/SystemService';
import SearchQuery from '@js/Search/Query/SearchQuery';
import Url from 'url-parse';
import TabManager from '@js/Manager/TabManager';
import SearchIndex from '@js/Search/Index/SearchIndex';

class RecommendationManager {

    constructor() {
        this._api = null;
        this._recommendations = [];

        this._tabEvent = (tab) => {
            if(!tab.hasOwnProperty('recommended') || tab.lastUrl !== tab.url) {
                this._updateRecommended(tab);
            }
        };

        this._searchEvent = () => {
            this._clearRecommended(TabManager.getAll());
            let tab = TabManager.get();
            if(tab) {
                this._updateRecommended(tab);
            }
        };
    }

    init() {
        this._api = SystemService.getBrowserApi();
        TabManager.tabChanged.on(this._tabEvent);
        SearchIndex.listen.on(this._searchEvent);
    }

    /**
     *
     * @returns {Password[]}
     */
    getRecommendations() {
        if(!TabManager.has('recommended')) return [];

        return TabManager.get('recommended');
    }

    /**
     *
     * @return {boolean}
     */
    hasRecommendations() {
        return TabManager.has('recommended');
    }

    /**
     *
     * @param {Object} tab
     * @private
     */
    _updateRecommended(tab) {
        let start = new Date().getTime();
        let url = Url(tab.url);

        delete tab.recommended;
        if(url.host.length === 0) {
            this._updateBadge(tab);
            return;
        }

        let query = new SearchQuery('or');
        query
            .where(
                query.field('host').equals(url.host),
                query.field('url').contains(url.pathname.length > 1 ? url.host + url.pathname:url.host)
            )
            .type('password')
            .score(0.4)
            .sortBy('favorite')
            .sortBy('shared')
            .sortBy('score')
            .sortBy('label');

        let recommendations = query.execute();
        if(recommendations.length !== 0) {
            tab.recommended = recommendations;
        }
        this._updateBadge(tab);

        let time = new Date().getTime() - start;
        console.log(`Found ${tab.recommended ? tab.recommended.length:0} recommendations for ${url.host} in ${time}ms`, url);
    }

    /**
     *
     * @param {Object} tab
     * @private
     */
    _updateBadge(tab) {
        if(tab.hasOwnProperty('recommended')) {
            this._api.browserAction.setBadgeText({text: tab.recommended.length.toString(), tabId: tab.id});
        } else {
            this._api.browserAction.setBadgeText({text: '', tabId: tab.id});
        }

        if(SystemService.getBrowserPlatform() === 'firefox') {
            this._api.browserAction.setBadgeTextColor({color: '#fff'});
        }

        this._api.browserAction.setBadgeBackgroundColor({color: '#0082c9'});
    }

    /**
     *
     * @param {Object[]} tabs
     * @private
     */
    _clearRecommended(tabs) {
        for(let tab of tabs) {
            if(tab && tab.hasOwnProperty('recommended')) {
                delete tab.recommended;
            }
        }
    }
}

export default new RecommendationManager();