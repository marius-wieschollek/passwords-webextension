import Url from 'url-parse';
import TabManager from '@js/Manager/TabManager';
import EventQueue from '@js/Event/EventQueue';
import SettingsService from '@js/Services/SettingsService';
import {subscribe} from "@js/Event/Events";
import SearchService from "@js/Services/SearchService";

class RecommendationManager {

    get listen() {
        return this._change;
    }

    constructor() {
        this._change = new EventQueue();
        this._options = { initialized: false, mode: "host", maxRows: 8 }

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
        this.initRecommendationOptions();
        TabManager.tabChanged.on(this._tabEvent);
        TabManager.urlChanged.on(this._tabEvent);
        subscribe('search:items:changed', this._searchEvent);
    }

    initRecommendationOptions() {
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
        for(let id in tabs) {
            if(!tabs.hasOwnProperty(id)) {
                continue;
            }
            let tab = tabs[id];
            if(tab && tab.hasOwnProperty('recommended')) {
                delete tab.recommended;
            }
        }
    }
}

export default new RecommendationManager();
