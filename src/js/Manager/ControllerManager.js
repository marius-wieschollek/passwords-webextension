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
                let module = await import('@js/Controller/Password/Related');
                await this._executeController(module, message, reply);
            }
        );
        MessageService.listen(
            'password.search',
            async (message, reply) => {
                let module = await import('@js/Controller/Password/Search');
                await this._executeController(module, message, reply);
            }
        );
        MessageService.listen(
            'password.fill',
            async (message, reply) => {
                let module = await import('@js/Controller/Password/Fill');
                await this._executeController(module, message, reply);
            }
        );
        MessageService.listen(
            'password.mine',
            async (message, reply) => {
                let module = await import('@js/Controller/Password/Mine');
                await this._executeController(module, message, reply);
            }
        );
        MessageService.listen(
            'password.favicon',
            async (message, reply) => {
                let module = await import('@js/Controller/Password/Favicon');
                await this._executeController(module, message, reply);
            }
        );
        MessageService.listen(
            'folder.list',
            async (message, reply) => {
                let module = await import('@js/Controller/Folder/List');
                await this._executeController(module, message, reply);
            }
        );
        MessageService.listen(
            'folder.show',
            async (message, reply) => {
                let module = await import('@js/Controller/Folder/Show');
                await this._executeController(module, message, reply);
            }
        );
        MessageService.listen(
            'server.list',
            async (message, reply) => {
                let module = await import('@js/Controller/Server/List');
                await this._executeController(module, message, reply);
            }
        );
        MessageService.listen(
            'server.reload',
            async (message, reply) => {
                let module = await import('@js/Controller/Server/Reload');
                await this._executeController(module, message, reply);
            }
        );
        MessageService.listen(
            'server.info',
            async (message, reply) => {
                let module = await import('@js/Controller/Server/Info');
                await this._executeController(module, message, reply);
            }
        );
        MessageService.listen(
            'server.create',
            async (message, reply) => {
                let module = await import('@js/Controller/Server/Create');
                await this._executeController(module, message, reply);
            }
        );
        MessageService.listen(
            'server.delete',
            async (message, reply) => {
                let module = await import('@js/Controller/Server/Delete');
                await this._executeController(module, message, reply);
            }
        );
        MessageService.listen(
            'token.request',
            async (message, reply) => {
                let module = await import('@js/Controller/Token/Request');
                await this._executeController(module, message, reply);
            }
        );
        MessageService.listen(
            'popup.status',
            async (message, reply) => {
                let module = await import('@js/Controller/Popup/Status');
                await this._executeController(module, message, reply);
            }
        );
        MessageService.listen(
            'options.status',
            async (message, reply) => {
                let module = await import('@js/Controller/Options/Status');
                await this._executeController(module, message, reply);
            }
        );
        MessageService.listen(
            'setting.set',
            async (message, reply) => {
                let module = await import('@js/Controller/Setting/Set');
                await this._executeController(module, message, reply);
            }
        );
        MessageService.listen(
            'setting.get',
            async (message, reply) => {
                let module = await import('@js/Controller/Setting/Get');
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
            ErrorManager.logError(e);
        }
    }
}

export default new ControllerManager();