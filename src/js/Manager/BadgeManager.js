import SystemService from '@js/Services/SystemService';
import RecommendationManager from '@js/Manager/RecommendationManager';
import TabManager from '@js/Manager/TabManager';
import ServerManager from '@js/Manager/ServerManager';
import ErrorManager from '@js/Manager/ErrorManager';

class BadgeManager {

    constructor() {
        this._api = null;
    }

    init() {
        this._api = SystemService.getBrowserApi();
        RecommendationManager.listen.on(
            async (r) => {
                await this._updateBadge(r);
            }
        );
        TabManager.tabUpdated.on(
            async () => {
                let r = RecommendationManager.getRecommendations();
                await this._updateBadge(r);
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
    async _updateBadge(recommended) {
        let tabId = TabManager.currentTabId;
        if(tabId === 0) return;

        try {
            if(!ServerManager.isAuthorized.get()) {
                await this._api.browserAction.setBadgeText({text: '!', tabId});
            } else if(recommended.length !== 0) {
                await this._api.browserAction.setBadgeText({text: recommended.length.toString(), tabId});
            } else {
                await this._api.browserAction.setBadgeText({text: '', tabId});
            }

            if(SystemService.getBrowserPlatform() === 'firefox') {
                await this._api.browserAction.setBadgeTextColor({color: '#fff'});
            }
            await this._api.browserAction.setBadgeBackgroundColor({color: '#0082c9'});
        } catch(e) {
            ErrorManager.logError(e);
        }
    }
}

export default new BadgeManager();