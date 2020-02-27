import MessageService from '@js/Services/MessageService';
import FillPassword from '@js/Controller/Client/FillPassword';
import ErrorManager from '@js/Manager/ErrorManager';

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
    }
}

export default new ClientControllerManager();