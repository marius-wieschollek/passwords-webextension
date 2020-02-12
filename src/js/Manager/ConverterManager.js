import MessageService from '@js/Services/MessageService';
import ServerConverter from '@js/Converter/ServerConverter';
import PasswordConverter from '@js/Converter/PasswordConverter';
import ErrorManager from '@js/Manager/ErrorManager';
import FolderConverter from '@js/Converter/FolderConverter';

class ConverterManager {

    init() {
        MessageService.convert(
            ['password.items', 'folder.items', 'popup.data'],
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
        MessageService.convert(
            ['folder.items'],
            async (message) => {
                await this._executeConverter(FolderConverter, message);
            }
        );
    }


    /**
     *
     * @param {Object} module
     * @param {Message} message
     * @private
     */
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