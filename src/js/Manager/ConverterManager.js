import ErrorManager from '@js/Manager/ErrorManager';
import MessageService from '@js/Services/MessageService';
import ThemeConverter from '@js/Converter/ThemeConverter';
import FolderConverter from '@js/Converter/FolderConverter';
import ServerConverter from '@js/Converter/ServerConverter';
import PasswordConverter from '@js/Converter/PasswordConverter';
import PasteRequestConverter from "@js/Converter/PasteRequestConverter";

class ConverterManager {

    init() {
        MessageService.convert(
            ['password.items', 'password.suggestions', 'folder.items'],
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
            ['folder.items', 'folder.item'],
            async (message) => {
                await this._executeConverter(FolderConverter, message);
            }
        );
        MessageService.convert(
            ['theme.items', 'theme.item', 'theme.save', 'theme.preview'],
            async (message) => {
                await this._executeConverter(ThemeConverter, message);
            }
        );
        MessageService.convert(
            ['autofill.password'],
            async (message) => {
                await this._executeConverter(PasteRequestConverter, message);
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
            ErrorManager.logError(e, {module, message});
        }
    }
}

export default new ConverterManager();