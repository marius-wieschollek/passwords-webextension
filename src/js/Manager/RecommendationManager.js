import SystemService from '@js/Services/SystemService';
import SearchQuery from '@js/Search/Query/SearchQuery';
import Url from 'url-parse';
import TabManager from '@js/Manager/TabManager';
import SearchIndex from '@js/Search/Index/SearchIndex';
import EventQueue from '@js/Event/EventQueue';

class RecommendationManager {

    get listen() {
        return this._change;
    }

    constructor() {
        this._api = null;
        this._change = new EventQueue();

        this._tabEvent = (tab) => {
            if(!tab.hasOwnProperty('recommended') || tab.lastUrl !== tab.url) {
                this._updateRecommended(tab);
            } else {
                this._change.emit(tab.recommended);
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
        let url = Url(tab.url);

        delete tab.recommended;
        if(url.host.length === 0) {
            this._change.emit([]);
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
            .limit(8)
            .sortBy('favorite')
            .sortBy('shared')
            .sortBy('score')
            .sortBy('label');

        let recommendations = query.execute();
        if(recommendations.length !== 0) {
            tab.recommended = recommendations;
        }
        this._change.emit(recommendations);
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