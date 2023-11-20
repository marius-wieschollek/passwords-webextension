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
                    .catch(ErrorManager.catchEvt);
            }
        );
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
                    onclick : () => {
                        this._sendPassword(password);
                    }
                }
            );

            if(SystemService.isCompatible(SystemService.PLATFORM_FIREFOX)) {
                this._loadIcons(password)
                    .catch(ErrorManager.catchEvt);
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
                data.onclick = () => {
                    this._openBrowserAction();
                };
            }
        }

        menu.create(data);
    }

    /**
     *
     * @param {Password} password
     * @private
     */
    _sendPassword(password) {
        MessageService.send(
            {
                type    : 'autofill.password',
                receiver: 'client',
                channel : 'tabs',
                tab     : TabManager.currentTabId,
                payload : AutofillRequestHelper.createPasteRequest(password, false, true)
            }
        );
    }

    /**
     *
     * @private
     */
    _openBrowserAction() {
        SystemService.getBrowserApi().browserAction.openPopup();
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
}

export default new ContextMenuManager();