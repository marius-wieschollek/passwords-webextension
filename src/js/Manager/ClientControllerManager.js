import MessageService from '@js/Services/MessageService';
import FillPassword from '@js/Controller/Client/FillPassword';
import ErrorManager from '@js/Manager/ErrorManager';
import ShowFields from "@js/Controller/Client/Debug/ShowFields";

class ClientControllerManager {
    init() {
        this._initClientControllers();
    }

    _initClientControllers() {
        MessageService.listen(
            'autofill.password',
            async (message, reply) => {
                try {
                    let controller = new FillPassword();
                    await controller.execute(message, reply);
                } catch(e) {
                    ErrorManager.logError(e, {message, reply});
                }
            }
        );
        MessageService.listen(
            'debug.form.fields',
            async (message, reply) => {
                try {
                    let controller = new ShowFields();
                    await controller.execute(message, reply);
                } catch(e) {
                    ErrorManager.logError(e, {message, reply});
                }
            }
        );
    }
}

export default new ClientControllerManager();