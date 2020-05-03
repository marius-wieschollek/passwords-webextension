import MessageService from '@js/Services/MessageService';
import ErrorManager from '@js/Manager/ErrorManager';

class ControllerManager {
    init() {
        this._initBackgroundControllers();
    }

    /**
     *
     * @private
     */
    _initBackgroundControllers() {
        MessageService.listen(
            'password.related',
            async (message, reply) => {
                let module = await import(/* webpackChunkName: "PasswordRelated" */ '@js/Controller/Password/Related');
                await this._executeController(module, message, reply);
            }
        );
        MessageService.listen(
            'password.search',
            async (message, reply) => {
                let module = await import(/* webpackChunkName: "PasswordSearch" */ '@js/Controller/Password/Search');
                await this._executeController(module, message, reply);
            }
        );
        MessageService.listen(
            'password.fill',
            async (message, reply) => {
                let module = await import(/* webpackChunkName: "PasswordFill" */ '@js/Controller/Password/Fill');
                await this._executeController(module, message, reply);
            }
        );
        MessageService.listen(
            'password.mine',
            async (message, reply) => {
                let module = await import(/* webpackChunkName: "PasswordMine" */ '@js/Controller/Password/Mine');
                await this._executeController(module, message, reply);
            }
        );
        MessageService.listen(
            'password.favicon',
            async (message, reply) => {
                let module = await import(/* webpackChunkName: "PasswordFavicon" */ '@js/Controller/Password/Favicon');
                await this._executeController(module, message, reply);
            }
        );
        MessageService.listen(
            'folder.list',
            async (message, reply) => {
                let module = await import(/* webpackChunkName: "FolderList" */ '@js/Controller/Folder/List');
                await this._executeController(module, message, reply);
            }
        );
        MessageService.listen(
            'folder.show',
            async (message, reply) => {
                let module = await import(/* webpackChunkName: "FolderShow" */ '@js/Controller/Folder/Show');
                await this._executeController(module, message, reply);
            }
        );
        MessageService.listen(
            'server.list',
            async (message, reply) => {
                let module = await import(/* webpackChunkName: "ServerList" */ '@js/Controller/Server/List');
                await this._executeController(module, message, reply);
            }
        );
        MessageService.listen(
            'server.reload',
            async (message, reply) => {
                let module = await import(/* webpackChunkName: "ServerReload" */ '@js/Controller/Server/Reload');
                await this._executeController(module, message, reply);
            }
        );
        MessageService.listen(
            'server.info',
            async (message, reply) => {
                let module = await import(/* webpackChunkName: "ServerInfo" */ '@js/Controller/Server/Info');
                await this._executeController(module, message, reply);
            }
        );
        MessageService.listen(
            'server.theme',
            async (message, reply) => {
                let module = await import(/* webpackChunkName: "ServerTheme" */ '@js/Controller/Server/Theme');
                await this._executeController(module, message, reply);
            }
        );
        MessageService.listen(
            'server.create',
            async (message, reply) => {
                let module = await import(/* webpackChunkName: "ServerCreate" */ '@js/Controller/Server/Create');
                await this._executeController(module, message, reply);
            }
        );
        MessageService.listen(
            'server.update',
            async (message, reply) => {
                let module = await import(/* webpackChunkName: "ServerUpdate" */ '@js/Controller/Server/Update');
                await this._executeController(module, message, reply);
            }
        );
        MessageService.listen(
            'server.delete',
            async (message, reply) => {
                let module = await import(/* webpackChunkName: "ServerDelete" */ '@js/Controller/Server/Delete');
                await this._executeController(module, message, reply);
            }
        );
        MessageService.listen(
            'token.request',
            async (message, reply) => {
                let module = await import(/* webpackChunkName: "TokenRequest" */ '@js/Controller/Token/Request');
                await this._executeController(module, message, reply);
            }
        );
        MessageService.listen(
            'popup.status.get',
            async (message, reply) => {
                let module = await import(/* webpackChunkName: "PopupStatusGet" */ '@js/Controller/Popup/Status/Get');
                await this._executeController(module, message, reply);
            }
        );
        MessageService.listen(
            'popup.status.set',
            async (message, reply) => {
                let module = await import(/* webpackChunkName: "PopupStatusSet" */ '@js/Controller/Popup/Status/Set');
                await this._executeController(module, message, reply);
            }
        );
        MessageService.listen(
            'popup.mining.update',
            async (message, reply) => {
                let module = await import(/* webpackChunkName: "UpdateMiningItem" */ '@js/Controller/Popup/UpdateMiningItem');
                await this._executeController(module, message, reply);
            }
        );
        MessageService.listen(
            'options.status',
            async (message, reply) => {
                let module = await import(/* webpackChunkName: "OptionsStatus" */ '@js/Controller/Options/Status');
                await this._executeController(module, message, reply);
            }
        );
        MessageService.listen(
            'setting.set',
            async (message, reply) => {
                let module = await import(/* webpackChunkName: "SettingSet" */ '@js/Controller/Setting/Set');
                await this._executeController(module, message, reply);
            }
        );
        MessageService.listen(
            'setting.get',
            async (message, reply) => {
                let module = await import(/* webpackChunkName: "SettingGet" */ '@js/Controller/Setting/Get');
                await this._executeController(module, message, reply);
            }
        );
        MessageService.listen(
            'setting.reset',
            async (message, reply) => {
                let module = await import(/* webpackChunkName: "SettingReset" */ '@js/Controller/Setting/Reset');
                await this._executeController(module, message, reply);
            }
        );
        MessageService.listen(
            'theme.list',
            async (message, reply) => {
                let module = await import(/* webpackChunkName: "ThemeList" */ '@js/Controller/Theme/List');
                await this._executeController(module, message, reply);
            }
        );
        MessageService.listen(
            'theme.show',
            async (message, reply) => {
                let module = await import(/* webpackChunkName: "ThemeShow" */ '@js/Controller/Theme/Show');
                await this._executeController(module, message, reply);
            }
        );
        MessageService.listen(
            'theme.save',
            async (message, reply) => {
                let module = await import(/* webpackChunkName: "ThemeSave" */ '@js/Controller/Theme/Save');
                await this._executeController(module, message, reply);
            }
        );
        MessageService.listen(
            'passlink.status',
            async (message, reply) => {
                let module = await import(/* webpackChunkName: "PassLinkStatus" */ '@js/Controller/PassLink/Status');
                await this._executeController(module, message, reply);
            }
        );
        MessageService.listen(
            'passlink.analyze',
            async (message, reply) => {
                let module = await import(/* webpackChunkName: "PassLinkAnalyze" */ '@js/Controller/PassLink/Analyze');
                await this._executeController(module, message, reply);
            }
        );
        MessageService.listen(
            'passlink.action',
            async (message, reply) => {
                let module = await import(/* webpackChunkName: "PassLinkAction" */ '@js/Controller/PassLink/Action');
                await this._executeController(module, message, reply);
            }
        );
        MessageService.listen(
            'passlink.connect.theme',
            async (message, reply) => {
                let module = await import(/* webpackChunkName: "PassLinkConnectTheme" */ '@js/Controller/PassLink/Connect/Theme');
                await this._executeController(module, message, reply);
            }
        );
        MessageService.listen(
            'passlink.connect.codes',
            async (message, reply) => {
                let module = await import(/* webpackChunkName: "PassLinkConnectCodes" */ '@js/Controller/PassLink/Connect/Codes');
                await this._executeController(module, message, reply);
            }
        );
        MessageService.listen(
            'passlink.connect.apply',
            async (message, reply) => {
                let module = await import(/* webpackChunkName: "PassLinkConnectApply" */ '@js/Controller/PassLink/Connect/Apply');
                await this._executeController(module, message, reply);
            }
        );
        MessageService.listen(
            'tab.popout',
            async (message, reply) => {
                let module = await import(/* webpackChunkName: "TabPopout" */ '@js/Controller/Tab/Popout');
                await this._executeController(module, message, reply);
            }
        );
        MessageService.listen(
            'tab.close',
            async (message, reply) => {
                let module = await import(/* webpackChunkName: "TabClose" */ '@js/Controller/Tab/Close');
                await this._executeController(module, message, reply);
            }
        );
    }

    /**
     *
     * @param {Object} module
     * @param {Message} message
     * @param {Message} reply
     * @returns {Promise<void>}
     * @private
     */
    async _executeController(module, message, reply) {
        try {
            let controller = new module.default();
            await controller.execute(message, reply);
        } catch(e) {
            ErrorManager.logError(e, {module, message, reply});
        }
    }
}

export default new ControllerManager();