import SystemService         from '@js/Services/SystemService';
import RecommendationManager from '@js/Manager/RecommendationManager';
import LocalisationService   from '@js/Services/LocalisationService';
import MessageService        from '@js/Services/MessageService';
import TabManager            from '@js/Manager/TabManager';
import ErrorManager          from '@js/Manager/ErrorManager';
import ThemeService          from '@js/Services/ThemeService';
import FaviconService        from '@js/Services/FaviconService';
import AutofillRequestHelper from "@js/Helper/AutofillRequestHelper";
import UuidHelper            from "@js/Helper/UuidHelper";
import SearchService from "@js/Services/SearchService";

class ContextMenuManager {

    constructor() {
        this._activeMenus = [];
    }

    /**
     *
     */
    init() {
        if(!SystemService.hasContextMenu()) return;
        RecommendationManager.listen.on(
            (r) => {
                this._updateContextMenu(r)
                    .catch(ErrorManager.catch);
            }
        );
        SystemService.getContextMenu().onClicked.addListener(
            (i,t) => { this._processContextMenuClick(i,t); }
        )
    }

    /**
     *
     * @param {Password[]} recommended
     * @private
     */
    async _updateContextMenu(recommended) {
        SystemService.getContextMenu().removeAll();
        this._activeMenus = [];

        if(recommended.length === 0) {
            this._createBasicMenu();
        } else {
            await this._createRecommendationMenu(recommended);
        }
    }

    /**
     *
     * @private
     */
    _createBasicMenu() {
        this._createMenu(
            {
                id     : 'open-browser-action',
                icons  : {16: 'img/passwords-dark.svg'},
                title  : LocalisationService.translate('contextMenuTitle'),
                command: '_execute_browser_action'
            }
        );
    }

    /**
     *
     * @param {EnhancedPassword[]} recommended
     * @private
     */
    async _createRecommendationMenu(recommended) {
        let menuId      = UuidHelper.generate(),
            defaultIcon = await ThemeService.getBadgeIcon();

        this._createMenu(
            {
                id     : menuId,
                icons  : {16: defaultIcon},
                title  : LocalisationService.translate('contextMenuTitle'),
                command: '_execute_browser_action'
            }
        );

        for(let password of recommended) {
            this._createMenu(
                {
                    parentId: menuId,
                    id      : password.getId(),
                    icons   : {16: defaultIcon},
                    title   : password.getLabel(),
                    // @TODO does this still work with firefox?
/*                    onclick : () => {
                        this._sendPassword(password);
                    }*/
                }
            );

            if(SystemService.isCompatible(SystemService.PLATFORM_FIREFOX)) {
                this._loadIcons(password)
                    .catch(ErrorManager.catch);
            }
        }
    }

    /**
     *
     * @return {String[]}
     * @private
     */
    _getContexts() {
        if(SystemService.isCompatible(SystemService.PLATFORM_FIREFOX)) {
            return ['page', 'password', 'editable', 'frame'];
        }

        return ['page', 'editable', 'frame'];
    }

    /**
     *
     * @param {Object} data
     * @private
     */
    _createMenu(data) {
        let menu = SystemService.getContextMenu();
        this._activeMenus.push(data.id);

        data.contexts = this._getContexts();
        if(SystemService.isCompatible(SystemService.PLATFORM_CHROME)) {
            delete data.icons;

            if(data.hasOwnProperty('command')) {
                delete data.command;
                // @TODO does this still work with firefox?
/*                data.onclick = () => {
                    this._openBrowserAction();
                };*/
            }
        }

        menu.create(data);
    }

    /**
     *
     * @param {(Password|String)} password
     * @private
     */
    _sendPassword(password, tabId = null) {
        if(typeof password === "string") {
            password = SearchService.get(password);
            if(password === null) {
                return;
            }
        }

        MessageService.send(
            {
                type    : 'autofill.password',
                receiver: 'client',
                channel : 'tabs',
                tab     : tabId === null ? TabManager.currentTabId:tabId,
                payload : AutofillRequestHelper.createPasteRequest(password)
            }
        );
    }

    /**
     *
     * @private
     */
    _openBrowserAction() {
        SystemService.getBrowserAction().openPopup();
    }

    /**
     * @param {EnhancedPassword} password
     * @returns {Promise<void>}
     * @private
     */
    async _loadIcons(password) {
        let icon16 = await FaviconService.getFaviconForPassword(password, 16, false),
            icon32 = await FaviconService.getFaviconForPassword(password, 32, false);

        if(this._activeMenus.indexOf(password.getId()) === -1) return;

        let menu = SystemService.getContextMenu();
        menu.update(
            password.getId(),
            {
                icons: {
                    16: icon16,
                    32: icon32
                }
            }
        );
    }

    _processContextMenuClick(itemInfo, tab) {
        if(itemInfo.menuItemId !== 'open-browser-action') {
            this._sendPassword(itemInfo.menuItemId, tab.id);
        } else {
            this._openBrowserAction();
        }
    }
}

export default new ContextMenuManager();