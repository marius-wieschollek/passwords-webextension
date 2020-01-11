import SystemService from '@js/Services/SystemService';
import RecommendationManager from '@js/Manager/RecommendationManager';
import TabManager from '@js/Manager/TabManager';
import QueueService from '@js/Services/QueueService';
import ServerManager from '@js/Manager/ServerManager';

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
        ServerManager.isAuthorized.onChange(
            () => {
                let r = RecommendationManager.getRecommendations();
                this._updateBadge(r);
            }
        );
    }

    /**
     *
     * @param {Password[]} recommended
     * @private
     */
    _updateBadge(recommended) {
        let tabId = TabManager.currentTabId;

        if(!ServerManager.isAuthorized.get()) {
            this._api.browserAction.setBadgeText({text: '!', tabId});
        } else if(recommended.length !== 0) {
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