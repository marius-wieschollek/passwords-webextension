import Url from 'url-parse';
import TabManager from '@js/Manager/TabManager';
import SettingsService from '@js/Services/SettingsService';
import {emit, subscribe} from "@js/Event/Events";
import SearchService from "@js/Services/SearchService";

class RecommendationManager {
    constructor() {
        this._options = { initialized: false, mode: "host", maxRows: 8 }

        this._tabEvent = (tab) => {
            if(!tab.hasOwnProperty('suggested') || tab.lastUrl !== tab.url) {
                this._updateSuggestions(tab);
            } else {
                emit('suggestions:updated', {suggestions: tab.suggested, tab});
            }
        };

        this._searchEvent = () => {
            this._clearRecommended(TabManager.getAll());
            let tab = TabManager.get();
            if(tab) {
                this._updateSuggestions(tab);
            }
        };
    }

    init() {
        this._initRecommendationOptions();
        subscribe('tab:current:updated', this._tabEvent);
        subscribe('tab:url:updated', this._tabEvent);
        subscribe('search:items:changed', this._searchEvent);
    }

    _initRecommendationOptions() {
        SettingsService.get('search.recommendation.mode')
        .then((value) => {
            this._options.initialized = true;
            this._options.mode = value;
        });
        SettingsService.get('search.recommendation.maxRows')
        .then((value) => {
            this._options.initialized = true;
            this._options.maxRows = value;
        });
    }

    /**
     *
     * @returns {Password[]}
     */
    getSuggestions() {
        if(!TabManager.has('suggested')) return [];

        return TabManager.get('suggested');
    }

    /**
     *
     * @return {Boolean}
     */
    hasRecommendations() {
        return TabManager.has('suggested');
    }

    /**
     * @param {String} url
     * @param {Boolean} incognito
     * @return {Password[]}
     */
    getSuggestionsForUrl(url, incognito = false) {
        if(!this._options.initialized) return [];
        url = Url(url);
        if(url.host.length === 0) return [];

        let query = SearchService
            .find('password', 'or')
            .where(this.getFilterQuery(url))
            .having('score', '>=', 0.3)
            .paginate('limit', this._options.maxRows.getValue())
            .boost('multiply', url.host)
            .boost('multiply', 'favorite', 2)
            .sortBy('score')
            .sortBy('favorite')
            .sortBy('uses')
            .sortBy('shared')
            .sortBy('score')
            .sortBy('label')
            .withHidden(incognito);

        return query.execute()
    }

    /**
     * @param {Url} url
     */
    getFilterQuery(url) {
        let mode = this._options.mode.getValue();
        if(mode === 'domain') {
            return [['host', 'contains', this.getSearchDomainFromHost(url.host)]];
        } else if(mode === 'host' || mode === 'hostport') {
            return [['host', 'equals', url.host]];
        } else {
            return [['url', 'equals', `${url.protocol}//${url.host}${url.pathname.length > 1 ? url.pathname : ""}`]];
        }
      }


    /**
     * @param {String} host
     */
    getSearchDomainFromHost(host) {
        let regIPAdress = /((^\s*((([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5]))\s*$)|(^\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\s*$))/;
        if (regIPAdress.test(host)) {
            return host;
        } else {
            let domain = host.split(':')[0];
            if(domain === domain.split('.')[0]) return domain;
            return domain.split('.').reverse()[1] + "." + domain.split('.').reverse()[0];
        }
    }

    /**
     *
     * @param {Object} tab
     * @private
     */
    _updateSuggestions(tab) {
        delete tab.suggested;

        let suggestions = this.getSuggestionsForUrl(tab.url, tab?.tab?.incognito === true);
        if(suggestions.length !== 0) {
            tab.suggested = suggestions;
        }

        emit('suggestions:updated', {suggestions, tab});
    }

    /**
     *
     * @param {Object[]} tabs
     * @private
     */
    _clearRecommended(tabs) {
        for(let id in tabs) {
            if(!tabs.hasOwnProperty(id)) {
                continue;
            }
            let tab = tabs[id];
            if(tab && tab.hasOwnProperty('suggested')) {
                delete tab.suggested;
            }
        }
    }
}

export default new RecommendationManager();
