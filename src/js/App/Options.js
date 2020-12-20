import Vue from 'vue';
import App from '@vue/App/Options.vue';
import ErrorManager from '@js/Manager/ErrorManager';
import SystemService from '@js/Services/SystemService';
import MessageService from '@js/Services/MessageService';
import ConverterManager from '@js/Manager/ConverterManager';
import ToastService from '@js/Services/ToastService';
import ThemeService from '@js/Services/ThemeService';
import SettingsService from '@js/Services/SettingsService';
import ClientSettingsProvider from '@js/Settings/ClientSettingsProvider';
import LocalisationService from "@js/Services/LocalisationService";

class Options {

    /**
     *
     * @return {(Vue|null)}
     */
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
            await MessageService.init(true, 'background');
            ConverterManager.init();
            SettingsService.init(ClientSettingsProvider);

            await ThemeService.apply();
            await LocalisationService.init();
            await this._initVue();
            await ToastService.init();
        } catch(e) {
            ErrorManager.logError(e);
        }
    }

    /**
     *
     * @return {Promise<void>}
     * @private
     */
    async _initVue() {
        let reply  = await MessageService.send('options.status'),
            status = reply.getPayload();
        document.body.classList.add(status.device)

        Vue.filter('capitalize', function (value) {
            if (!value) return ''
            value = value.toString()
            return value.charAt(0).toUpperCase() + value.slice(1)
        })

        this._app = new Vue({propsData: status, ...App});
    }
}

export default new Options();