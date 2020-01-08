import SystemService from '@js/Services/SystemService';
import ErrorManager from '@js/Manager/ErrorManager';
import MessageService from '@js/Services/MessageService';
import ConverterManager from '@js/Manager/ConverterManager';
import ClientControllerManager from '@js/Manager/ClientControllerManager';

class Client {
    async init() {
        console.log('client init');
        SystemService.setArea('client');
        ErrorManager.init();
        try {
            await SystemService.waitReady();
            SystemService.connect();
            MessageService.init(true, 'background');
            ConverterManager.init();
            ClientControllerManager.init();

            console.log('client ready');
        } catch(e) {
            console.log('client dead');
            ErrorManager.logError(e);
        }
    }
}

export default new Client();