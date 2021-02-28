import SearchQuery from '@js/Search/Query/SearchQuery';
import Url from 'url-parse';
import TabManager from '@js/Manager/TabManager';
import SearchIndex from '@js/Search/Index/SearchIndex';
import EventQueue from '@js/Event/EventQueue';
import SettingsService from '@js/Services/SettingsService';

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
        this.initRecommendationOptions();
    }

    initRecommendationOptions() {
        this.options = { searchQuery: "host", maxResults: 8 }
        SettingsService.getValue('search.recommendation.mode')
        .then((value) => {
            if(value) {
                this.options.searchQuery = value;
            }
        });
        SettingsService.getValue('search.recommendation.maxRows')
        .then((value) => {
            if(value) {
                this.options.maxRows = Number(value);
            }
        });
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
            .where(this.getFilterQuery(query, url))
            .type('password')
            .score(0.3)
            .limit(this.options.maxRows)
            .sortBy('favorite')
            .sortBy('uses')
            .sortBy('shared')
            .sortBy('score')
            .sortBy('label');

        if(incognito) query.hidden(true);

        return query.execute();
    }

    /**
     * @param {SearchQuery} query
     * @param {String} url
     */
    getFilterQuery(query, url) {
        let mode = this.options.searchQuery;
        if(mode === 'domain') {
            return query.field('host').contains(this.getSearchDomainFromHost(url.host));
        } else if(mode === 'host') {
            return query.field('host').startsWith(url.host.split(':')[0]);
        } else if(mode === 'hostport') {
            return query.field('host').equals(url.host);
        } else {
            return query.field('url').equals(url.protocol + "//" + url.host + (url.pathname.length > 1 ? url.pathname: ""));
        }
      }


    /**
     * @param {String} host
     */
    getSearchDomainFromHost(host) {
        var regIPAdress = /((^\s*((([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5]))\s*$)|(^\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\s*$))/;
        if (regIPAdress.test(host)) {
            return host;
        }
        else {
            var domain = host.split(':')[0];
            if(domain === domain.split('.')[0]) return domain;
            return domain.split('.').reverse()[1] + "." + domain.split('.').reverse()[0];
        }
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
