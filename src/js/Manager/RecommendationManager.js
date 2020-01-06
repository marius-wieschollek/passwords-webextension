import SystemService from '@js/Services/SystemService';
import ErrorManager from '@js/Manager/ErrorManager';
import SearchQuery from '@js/Search/Query/SearchQuery';
import Url from 'url-parse';

class RecommendationManager {
    init() {
        this._api = SystemService.getBrowserApi();
        this._currentUrl = null;
        this._recommendations = [];

        this._tabEvent = () => {
            this._updateRecommendations()
                .catch(ErrorManager.catch());
        };


        this._api.tabs.onActivated.addListener(this._tabEvent);
        this._api.tabs.onCreated.addListener(this._tabEvent);
        this._api.tabs.onUpdated.addListener(this._tabEvent);
        this._api.tabs.onReplaced.addListener(this._tabEvent);
        this._api.tabs.onHighlighted.addListener(this._tabEvent);
    }

    /**
     *
     * @returns {Password[]}
     */
    async getRecommendations() {
        await this._updateRecommendations();
        return this._recommendations;
    }

    async _updateRecommendations() {
        let start = new Date().getTime();
        let tabs = await this._api.tabs.query({active: true});
        if(tabs.length !== 1) return;

        let tab = tabs.pop();
        if(this._currentUrl === tab.url) return;

        this._currentUrl = tab.url;
        let url = Url(tab.url);

        if(url.host.length === 0) {
            this._recommendations = [];
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

        this._recommendations = query.execute();

        this._api.browserAction.setBadgeText({text: this._recommendations.length.toString(), tabId: tab.id});
        if(SystemService.getBrowserPlatform() === 'firefox') {
            this._api.browserAction.setBadgeTextColor({color: '#fff'});
        }
        this._api.browserAction.setBadgeBackgroundColor({color: '#0082c9'});

        let time = new Date().getTime() - start;
        console.log(`Found ${this._recommendations.length} recommendations for ${url.host} in ${time}ms`, url);
    }
}

export default new RecommendationManager();