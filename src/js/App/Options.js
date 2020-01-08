import Vue from 'vue';
import App from '@vue/App/Options.vue';
import ErrorManager from '@js/Manager/ErrorManager';
import SystemService from '@js/Services/SystemService';
import MessageService from '@js/Services/MessageService';
import ConverterManager from '@js/Manager/ConverterManager';

class Options {

    get app() {
        return this._app;
    }

    constructor() {
        this._app = null;
    }

    async init() {
        SystemService.setArea('options');
        ErrorManager.init();
        try {
            await SystemService.waitReady();
            SystemService.connect();
            MessageService.init(true, 'background');
            ConverterManager.init();

            this._app = new Vue(App);
        } catch(e) {
            ErrorManager.logError(e);
        }
    }
}

export default new Options();