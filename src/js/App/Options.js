import Vue from 'vue';
import App from '@vue/App/Options.vue';
import ErrorManager from '@js/Manager/ErrorManager';
import SystemService from '@js/Services/SystemService';
import MessageService from '@js/Services/MessageService';
import ConverterManager from '@js/Manager/ConverterManager';

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

            await this._initVue();
        } catch(e) {
            ErrorManager.logError(e);
        }
    }

    async _initVue() {
        let reply  = await MessageService.send({type: 'options.status'}),
            status = reply.getPayload();
        document.body.classList.add(status.device);

        this._app = new Vue({propsData: status, ...App});
    }
}

export default new Options();