import SystemService from '@js/Services/SystemService';
import RecommendationManager from '@js/Manager/RecommendationManager';
import TabManager from '@js/Manager/TabManager';
import ServerManager from '@js/Manager/ServerManager';
import ErrorManager from '@js/Manager/ErrorManager';
import LocalisationService from '@js/Services/LocalisationService';
import ThemeService from '@js/Services/ThemeService';
import MiningManager from "@js/Manager/MiningManager";
import {subscribe} from "@js/Event/Events";

class BadgeManager {

    constructor() {
        this._api = null;
    }

    init() {
        this._api = SystemService.getBrowserApi();
        const updateEvent = async () => {
            let r = RecommendationManager.getSuggestions();
            await this._updateBrowserAction(r);
        };

        subscribe('suggestions:updated', (e) => {this._updateBrowserAction(e.suggestions).catch(ErrorManager.catch);});
        subscribe('tab:updated', updateEvent);
        subscribe('mining:item:added', updateEvent);
        subscribe('mining:item:solved', updateEvent);

        ServerManager.isAuthorized.onChange(
            async (d) => {
                let r = RecommendationManager.getSuggestions();
                await this._updateBrowserAction(r);
            }
        );
    }

    /**
     *
     * @param {Password[]} recommended
     * @private
     */
    async _updateBrowserAction(recommended) {
        if(SystemService.hasBadge()) {
            await this._updateBadge(recommended);
            await this._updateTitle(recommended);
        } else {
            await this._updateTitle(recommended);
        }
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
            let badgeText = [];

            if(!ServerManager.isAuthorized.get()) {
                badgeText.push('!');
            } else {
                if(recommended.length !== 0) {
                    badgeText.push(recommended.length.toString());
                }
                let miningQueue = MiningManager.queueSize;
                if(miningQueue > 0) {
                    badgeText.push(`+${miningQueue}`);
                }
            }
            await this._api.browserAction.setBadgeText({text: badgeText.join(' '), tabId});

            await this._setBadgeTheme();
        } catch(e) {
            ErrorManager.logError(e);
        }
    }

    /**
     *
     * @param {Password[]} recommended
     * @private
     */
    async _updateTitle(recommended) {
        let tabId = TabManager.currentTabId;
        if(tabId === 0) return;

        try {
            if(ServerManager.isAuthorized.get() && recommended.length !== 0) {
                let count = recommended.length.toString(),
                    title = LocalisationService.translate('BrowserActionTitleCounter', [count]);
                await this._api.browserAction.setTitle({title, tabId});
            } else {
                let title = LocalisationService.translate('browserActionTitle');
                await this._api.browserAction.setTitle({title, tabId});
            }
        } catch(e) {
            ErrorManager.logError(e);
        }
    }

    async _setBadgeTheme() {
        if(SystemService.isCompatible(SystemService.PLATFORM_FIREFOX)) {
            let color = await ThemeService.getBadgeTextColor();
            await this._api.browserAction.setBadgeTextColor({color});
        }

        let color = await ThemeService.getBadgeBackgroundColor();
        await this._api.browserAction.setBadgeBackgroundColor({color});

        let icon = await ThemeService.getBadgeIcon();
        await this._api.browserAction.setIcon({path: icon});
    }
}

export default new BadgeManager();