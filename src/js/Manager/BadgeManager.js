import SystemService from '@js/Services/SystemService';
import RecommendationManager from '@js/Manager/RecommendationManager';
import TabManager from '@js/Manager/TabManager';

class BadgeManager {

    constructor() {
        this._api = null;
    }

    init() {
        this._api = SystemService.getBrowserApi();
        RecommendationManager.listen.on(
            (r) => {
                this._updateBadge(r);
            }
        );
    }

    /**
     *
     * @param {Array} recommended
     * @private
     */
    _updateBadge(recommended) {
        let tabId = TabManager.currentTabId;

        if(recommended.length !== 0) {
            this._api.browserAction.setBadgeText({text: recommended.length.toString(), tabId});
        } else {
            this._api.browserAction.setBadgeText({text: '', tabId});
        }

        if(SystemService.getBrowserPlatform() === 'firefox') {
            this._api.browserAction.setBadgeTextColor({color: '#fff'});
        }

        this._api.browserAction.setBadgeBackgroundColor({color: '#0082c9'});
    }
}

export default new BadgeManager();