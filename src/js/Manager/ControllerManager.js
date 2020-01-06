import MessageService from '@js/Services/MessageService';

class ControllerManager {
    init() {
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
            'server.list',
            async (message, reply) => {
                let module = await import('@js/Controller/Server/List');
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
    }

    async _executeController(module, message, reply) {
        let controller = new module.default();
        await controller.execute(message, reply);
    }
}

export default new ControllerManager();