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
        this.options = { searchQuery: "Host", maxResults: 8 }
        SettingsService.getValue('search.recommendation.option')
        .then((value) => {
            if(value) {
                this.options.searchQuery = value;
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
            .where(
                // search by domain
                (this.options.searchQuery === "domain" ? query.field('host').contains(this.getSearchDomainFromHost(url.host)): 
                    // search by hostname
                    (this.options.searchQuery === "host" ? query.field('host').startsWith(url.host.split(':')[0]): 
                        // search by hostname and port
                        (this.options.searchQuery === "hostport" ? query.field('host').equals(url.host): 
                            // search exact
                            (this.options.searchQuery === "exact" ? query.field('url').equals(url.protocol + "//" + url.host + (url.pathname.length > 1 ? url.pathname: "")):
                            "")
                        )
                    )
                )
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
     * @param {String} host
     */
    getSearchDomainFromHost(host) {
        var regIPAdress = /((^\s*((([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5]))\s*$)|(^\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\s*$))/;
        if (regIPAdress.test(host)) {
            return host;
        }
        else {
            var domain = host.split(':')[0];
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