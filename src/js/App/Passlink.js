import Vue from 'vue';
import App from '@vue/App/Passlink.vue';
import {PassLink} from 'passwords-client';
import ErrorManager from '@js/Manager/ErrorManager';
import SystemService from '@js/Services/SystemService';
import MessageService from '@js/Services/MessageService';
import ConverterManager from '@js/Manager/ConverterManager';
import ToastService from '@js/Services/ToastService';
import ThemeService from '@js/Services/ThemeService';
import SettingsService from '@js/Services/SettingsService';
import ClientSettingsProvider from '@js/Settings/ClientSettingsProvider';

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
            this._api = SystemService.getBrowserApi();

            let urlParams = new URLSearchParams(window.location.search);
            let link = urlParams.get('link');
            if(link !== null) {
                this._processLink(link);
            } else {
                let action = urlParams.get('action');
                let data = JSON.parse(urlParams.get('data'));
                await this._processAction(action, data);
            }
        } catch(e) {
            ErrorManager.logError(e);
        }
    }

    /**
     *
     * @param {String} action
     * @param {Object} data
     * @return {Promise<void>}
     * @private
     */
    async _initVue(action, data) {
        let reply  = await MessageService.send({type: 'passlink.status'}),
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
        console.log(action, data);
        await ThemeService.apply();
        await this._initVue(action, data);
        await ToastService.init();
    }

    /**
     *
     * @param {String} link
     * @private
     */
    _processLink(link) {
        try {
            let info = PassLink.analyzeLink(link);

            this._openInPopup(info.action, info.parameters);
        } catch(e) {
            this._processAction('error', {message: e.message, link});
            ErrorManager.logError(e);
        }
    }

    async _openInPopup(action, data = {}) {
        let current = await this._api.tabs.getCurrent(),
            parent  = await this._api.windows.getLastFocused(),
            offset  = {width: 14, height: 42, left: 25, top: 74},
            width   = 360 + offset.width,
            height  = 360 + offset.height,
            left    = Math.floor(parent.left + parent.width - width - offset.left),
            top     = Math.floor(parent.top + offset.top);

        let baseUrl     = await this._api.runtime.getURL('html/passlink.html'),
            encodedData = encodeURIComponent(JSON.stringify(data)),
            url         = `${baseUrl}?action=${action}&data=${encodedData}`;

        let info = await this._api.windows.create({type: 'panel', url, top, left, width, height});

        if(SystemService.getBrowserPlatform() === 'firefox') {
            await this._api.windows.update(info.id, {top, left});
        }

        await this._api.tabs.remove(current.id);
    }
}

export default new Passlink();