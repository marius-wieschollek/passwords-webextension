import MessageService from '@js/Services/MessageService';
import ServerConverter from '@js/Converter/ServerConverter';
import PasswordConverter from '@js/Converter/PasswordConverter';
import ErrorManager from '@js/Manager/ErrorManager';

class ConverterManager {
    init() {
        MessageService.convert(
            'password.items',
            async (message) => {
                await this._executeConverter(PasswordConverter, message);
            }
        );
        MessageService.convert(
            ['server.items', 'server.item'],
            async (message) => {
                await this._executeConverter(ServerConverter, message);
            }
        );
    }

    async _executeConverter(module, message) {
        try {
            let controller = new module();
            await controller.convert(message);
        } catch(e) {
            ErrorManager.logError(e);
        }
    }
}

export default new ConverterManager();