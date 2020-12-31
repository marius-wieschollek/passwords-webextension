import Vue from 'vue';
import App from '@vue/App/Popup.vue';
import ErrorManager from '@js/Manager/ErrorManager';
import SystemService from '@js/Services/SystemService';
import MessageService from '@js/Services/MessageService';
import ConverterManager from '@js/Manager/ConverterManager';
import AuthorisationClient from '@js/Queue/Client/AuthorisationClient';
import ToastService from '@js/Services/ToastService';
import ThemeService from '@js/Services/ThemeService';
import SettingsService from '@js/Services/SettingsService';
import ClientSettingsProvider from '@js/Settings/ClientSettingsProvider';
import LocalisationService from "@js/Services/LocalisationService";

class Popup {

    /**
     *
     * @return {(Vue|null)}
     */
    get app() {
        return this._app;
    }

    /**
     *
     * @return {(AuthorisationClient|null)}
     * @constructor
     */
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
            SettingsService.init(ClientSettingsProvider);
            this._authClient = new AuthorisationClient();

            await ThemeService.apply();
            await LocalisationService.init();
            await this._initVue();
            await ToastService.init();
        } catch(e) {
            ErrorManager.logError(e);
        }
    }

    async _initVue() {
        let reply  = await MessageService.send('popup.status.get'),
            status = reply.getPayload();
        document.body.classList.add(status.device);

        this._app = new Vue({propsData: status, ...App});
    }
}

export default new Popup();