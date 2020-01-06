import Vue from 'vue';
import App from '@vue/App/Popup.vue';
import ErrorManager from '@js/Manager/ErrorManager';
import SystemService from '@js/Services/SystemService';
import MessageService from '@js/Services/MessageService';
import ConverterManager from '@js/Manager/ConverterManager';
import AuthorisationClient from '@js/Queue/Client/AuthorisationClient';

class Popup {

    get app() {
        return this._app;
    }

    constructor() {
        this._app = null;
    }

    async init() {
        SystemService.setArea('popup');
        ErrorManager.init();
        try {
            await SystemService.waitReady();
            SystemService.connect();
            MessageService
                .setDefaultReceiver('background')
                .enable();
            ConverterManager.init();
            let acWorker = AuthorisationClient;

            this._app = new Vue(App);
        } catch(e) {
            ErrorManager.logError(e);
        }
    }
}

export default new Popup();