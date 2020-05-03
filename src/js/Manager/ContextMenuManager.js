import SystemService from '@js/Services/SystemService';
import RecommendationManager from '@js/Manager/RecommendationManager';
import LocalisationService from '@js/Services/LocalisationService';
import uuid from 'uuidv4';
import MessageService from '@js/Services/MessageService';
import TabManager from '@js/Manager/TabManager';

class ContextMenuManager {

    /**
     *
     */
    init() {
        if(!SystemService.hasContextMenu()) return;
        RecommendationManager.listen.on(
            (r) => {
                this._updateContextMenu(r);
            }
        );
    }

    /**
     *
     * @param {Password[]} recommended
     * @private
     */
    _updateContextMenu(recommended) {
        SystemService.getContextMenu().removeAll();

        if(recommended.length === 0) {
            this._createBasicMenu();
        } else {
            this._createRecommendationMenu(recommended);
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
     * @param {Password[]} recommended
     * @private
     */
    _createRecommendationMenu(recommended) {
        let menuId = uuid();

        this._createMenu(
            {
                id     : menuId,
                icons  : {16: 'img/passwords-dark.svg'},
                title  : LocalisationService.translate('contextMenuTitle'),
                command: '_execute_browser_action'
            }
        );

        for(let password of recommended) {
            this._createMenu(
                {
                    parentId: menuId,
                    id      : password.getId(),
                    icons   : {
                        16: password.getFaviconUrl(16),
                        32: password.getFaviconUrl(32)
                    },
                    title   : password.getLabel(),
                    onclick : () => {
                        this._sendPassword(password);
                    }
                }
            );
        }
    }

    /**
     *
     * @return {String[]}
     * @private
     */
    _getContexts() {
        if(SystemService.getBrowserPlatform() === 'firefox') {
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

        data.contexts = this._getContexts();
        if(SystemService.getBrowserPlatform() === 'chrome') {
            delete data.icons;

            if(data.hasOwnProperty('command')) {
                delete data.command;
                data.onclick = () => {
                    this._openBrowserAction();
                }
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
                payload : {
                    user    : password.getUserName(),
                    password: password.getPassword()
                }
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
}

export default new ContextMenuManager();