import Vue from 'vue';
import App from '@vue/App/Passlink.vue';
import ErrorManager from '@js/Manager/ErrorManager';
import SystemService from '@js/Services/SystemService';
import MessageService from '@js/Services/MessageService';
import ConverterManager from '@js/Manager/ConverterManager';
import ToastService from '@js/Services/ToastService';
import ThemeService from '@js/Services/ThemeService';
import SettingsService from '@js/Services/SettingsService';
import ClientSettingsProvider from '@js/Settings/ClientSettingsProvider';
import LocalisationService from "@js/Services/LocalisationService";

class Passlink {

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
        SystemService.setArea('passlink');
        ErrorManager.init();
        try {
            await SystemService.waitReady();
            SystemService.connect();
            await MessageService.init(true, 'background');
            ConverterManager.init();
            SettingsService.init(ClientSettingsProvider);
            await LocalisationService.init();

            let urlParams = new URLSearchParams(window.location.search),
                link      = urlParams.get('link'),
                action    = urlParams.get('action');
            if(link !== null) {
                await this._processLink(link);
            } else if(action !== null) {
                let data = urlParams.get('data');
                if(data !== null) data = JSON.parse(data);

                await this._processAction(action, data);
            } else {
                await this._processAction('error', {message: 'PasslinkNoLinkProvided'});
            }
        } catch(e) {
            ErrorManager.logError(e);
        }
    }

    /**
     *
     * @param {String} link
     * @return {Promise<void>}
     */
    async loadLink(link) {
        let info = await this._analyzeLink(link);

        this._app.action = info.action
        this._app.actionData = info.parameters
    }

    /**
     *
     * @param {String} action
     * @param {Object} data
     * @return {Promise<void>}
     * @private
     */
    async _initVue(action, data) {
        document.body.lang = LocalisationService.getLocale();

        let reply  = await MessageService.send('passlink.status'),
            status = reply.getPayload();
        document.body.classList.add(status.device);

        status.action = action;
        status.actionData = data;

        this._app = new Vue({propsData: status, ...App});
    }

    /**
     *
     * @param {String} action
     * @param {Object} data
     * @return {Promise<void>}
     * @private
     */
    async _processAction(action, data) {
        await ThemeService.apply();
        await this._initVue(action, data);
        await ToastService.init();
    }

    /**
     *
     * @param {String} link
     * @private
     */
    async _processLink(link) {
        let info = await this._analyzeLink(link);

        this._processAction(info.action, info.parameters).catch(ErrorManager.catch);
    }

    /**
     *
     * @param link
     * @return {Promise<void>}
     * @private
     */
    async _analyzeLink(link) {
        let reply = await MessageService.send({type: 'passlink.analyze', payload: link}),
            info  = reply.getPayload();

        if(info.action === 'connect') {
            await MessageService.send({type: 'tab.popout', payload: {url: location.href}}).catch(ErrorManager.catch);
        }

        reply = await MessageService.send({type: 'passlink.action', payload: info});
        if(!reply.getPayload().success) {
            info = {action: 'error', data: {link, message: reply.getPayload().message}};
        }

        return info;
    }
}

export default new Passlink();