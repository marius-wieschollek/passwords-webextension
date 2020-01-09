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
    get AuthorisationClient() {
        return this._authClient;
    }

    constructor() {
        this._app = null;
        this._authClient = null;
    }

    async init() {
        SystemService.setArea('popup');
        ErrorManager.init();
        try {
            await SystemService.waitReady();
            SystemService.connect();
            await MessageService.init(true, 'background');
            ConverterManager.init();
            this._authClient = new AuthorisationClient();

            await this._initVue();
        } catch(e) {
            ErrorManager.logError(e);
        }
    }

    async _initVue() {
        let reply  = await MessageService.send({type: 'popup.status'}),
            status = reply.getPayload();

        this._app = new Vue({propsData: status, ...App});
    }
}

export default new Popup();