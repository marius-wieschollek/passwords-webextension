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
        this.options = 
        { 
            conditions    : [ "exact", "hostport", "host", "domain" ],
            maxRows       : 8,
            domainMappings: undefined 
        }
        SettingsService.get('search.recommendation.maxRows')
        .then((value) => {
            this.options.maxRows = value;
        });
        SettingsService.get('domain.mapping.list')
        .then((value) => {
            this.options.domainMappings = value;
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

        var result = [];
        this.options.conditions.forEach((condition) => {
            var recommendations = this._getRecommendationsByCondition(url, incognito, condition);
           
            recommendations.forEach((recommendation) => {
                result.push(recommendation)
            });
        });
        result = result.filter((item, pos) => result.indexOf(item) === pos);

        return result.slice(0, this._getMaxRowsValue());
    }

    /**
     * @return {Integer}
     */
     _getMaxRowsValue() {
        if(!Number.isInteger(this.options.maxRows)) {
            return this.options.maxRows.getValue();
        }
        return this.options.maxRows
     }

    /**
     * @param {String} url
     * @param {Boolean} incognito
     * @param {String} condition
     * @return {Password[]}
     */
     _getRecommendationsByCondition(url, incognito, condition) {
        let query = this._getFilterQuery(url, condition)
        query
            .type('password')
            .score(0.3)
            .sortBy('favorite')
            .sortBy('uses')
            .sortBy('shared')
            .sortBy('label', true)
            .sortBy('username', true)
            .hidden(incognito);

        return query.execute();
    }

    /**
     * @param {URL} url
     * @param {String} condition
     * @return {SearchQuery}
     */
     _getFilterQuery(url, condition) {
       let query = new SearchQuery('or');
       
       if(condition === 'domain') {
            return this._getFilterDomainMappingQuery(query, url)
        } else if(condition === 'host') {
            return query.where(query.field('host').startsWith(url.host.split(':')[0]));
        } else if(condition === 'hostport') {
            return query.where(query.field('host').equals(url.host));
        } else {
            return query.where(query.field('url').equals(url.protocol + "//" + url.host + (url.pathname.length > 1 ? url.pathname: "")));
        }
      }

    /**
     * @param {SearchQuery} query
     * @param {URL} url
     * @return {SearchQuery}
     */
    _getFilterDomainMappingQuery(query, url) {
        let searchDomain = this._getSearchDomainFromHost(url.host);
        query.where(query.field('host').contains(this._getSearchDomainFromHost(url.host)));

        if(this.options.domainMappings !== undefined &&
            this.options.domainMappings.getValue() !== undefined) {
                
            let mappings = this.options.domainMappings.getValue();
            mappings.forEach((mapping) => {
                if(mapping.indexOf(searchDomain) > -1) {
                    mapping.forEach((domain) => {
                        query.where(query.field('host').contains(domain));
                    })
                }
            })
        }

        return query;
      }


    /**
     * @param {String} host
     */
    _getSearchDomainFromHost(host) {
        let regIPAdress = /((^\s*((([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5]))\s*$)|(^\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\s*$))/;
        if (regIPAdress.test(host)) {
            return host;
        } else {
            let domain = host.split(':')[0];
            let domainArray = domain.split('.').reverse();
            if(domain === domainArray[0]) return domain;

            if(domainArray[1].length <= 2 && domainArray.length > 2) {
                return domainArray[2] + "." + domainArray[1] + "." + domainArray[0]
            }

            return domainArray[1] + "." + domainArray[0];
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
