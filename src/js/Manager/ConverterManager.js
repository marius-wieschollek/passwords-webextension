import MessageService from '@js/Services/MessageService';

class ConverterManager {
    init() {
        MessageService.convert(
            'password.items',
            async (message) => {
                let module = await import('@js/Converter/PasswordConverter');
                await this._executeConverter(module, message);
            }
        );
        MessageService.convert(
            ['server.items', 'server.item'],
            async (message) => {
                let module = await import('@js/Converter/ServerConverter');
                await this._executeConverter(module, message);
            }
        );
    }

    async _executeConverter(module, message) {
        let controller = new module.default();
        await controller.convert(message);
    }
}

export default new ConverterManager();