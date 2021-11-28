import SystemService from '@js/Services/SystemService';
import ErrorManager from '@js/Manager/ErrorManager';
import MessageService from '@js/Services/MessageService';
import ConverterManager from '@js/Manager/ConverterManager';
import ClientControllerManager from '@js/Manager/ClientControllerManager';
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
            this._initAutofill();
        } catch(e) {
            ErrorManager.logError(e);
        }
    }


    /**
     *
     */
    _initAutofill() {
        if(document.readyState === "complete"
           || document.readyState === "loaded"
           || document.readyState === "interactive") {
            this._sendAutofillReadyMessage();
        } else {
            window.addEventListener(
                'DOMContentLoaded',
                () => {
                    this._sendAutofillReadyMessage();
                }
            );
        }
    }

    /**
     *
     */
    _sendAutofillReadyMessage() {
        MessageService.send(
            {
                type    : 'autofill.page.ready',
                payload : {
                    url: window.location.href
                },
                receiver: 'background'
            }
        );
    }
}

export default new Client();