import SystemService from '@js/Services/SystemService';
import ErrorManager from '@js/Manager/ErrorManager';
import MessageService from '@js/Services/MessageService';
import ConverterManager from '@js/Manager/ConverterManager';
import ClientControllerManager from '@js/Manager/ClientControllerManager';
import AutofillManager from '@js/Manager/AutofillManager';
import DomMiner from '@js/Miner/DomMiner';

class Client {
    async init() {
        SystemService.setArea('client');
        ErrorManager.init();
        try {
            await SystemService.waitReady();
            SystemService.connect();
            await MessageService.init(true, 'background');
            ConverterManager.init();
            ClientControllerManager.init();
            let miner = new DomMiner();
            miner.init();
            AutofillManager.initClient();
        } catch(e) {
            ErrorManager.logError(e);
        }
    }
}

export default new Client();