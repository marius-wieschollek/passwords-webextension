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
        TabManager.tabChanged.on(this._tabEvent);
        TabManager.urlChanged.on(this._tabEvent);
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
     * @return {Boolean}
     */
    hasRecommendations() {
        return TabManager.has('recommended');
    }

    /**
     * @param {String} url
     * @param {Boolean} incognito
     * @return {Password[]}
     */
    getRecommendationsByUrl(url, incognito = false) {
        url = Url(url);
        if(url.host.length === 0) return [];

        let query = new SearchQuery('or');
        query
            .where(
                query.field('host').equals(url.host),
            )
            .type('password')
            .score(0.3)
            .limit(8)
            .sortBy('favorite')
            .sortBy('uses')
            .sortBy('shared')
            .sortBy('score')
            .sortBy('label');

        if(incognito) query.hidden(true);

        return query.execute();
    }

    /**
     *
     * @param {Object} tab
     * @private
     */
    _updateRecommended(tab) {
        delete tab.recommended;

        let recommendations = this.getRecommendationsByUrl(tab.url, tab.tab.incognito);
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
