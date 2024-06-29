import MessageService from "@js/Services/MessageService";
import TabManager from "@js/Manager/TabManager";
import ErrorManager from "@js/Manager/ErrorManager";
import SettingsService from "@js/Services/SettingsService";
import AutofillRequestHelper from "@js/Helper/AutofillRequestHelper";
import {subscribe} from "@js/Event/Events";
import Url from "url-parse";

export default new class AutofillManager {

    constructor() {
        this.recommendations = [];
        this.currentURL = null;
        this._enabled = false;
        this._autofillEnabled = null;
        this._ingoredDomainsSetting = null;
        subscribe('suggestions:updated', (event) => {
            this.recommendations = event.suggestions;
            this.currentURL = event.tab.url;
            this._sendAutofillPassword(event.suggestions, event.tab.url);
        });
    }

    /**
     * @param {Boolean} on
     */
    toggle(on = true) {
        this._enabled = on;
    }

    /**
     *
     */
    async init() {
        MessageService.listen(
            'autofill.page.ready',
            (message) => {
                if(message.payload.hasOwnProperty('url') && message.payload.url === this.currentURL) {
                    this._sendAutofillPassword(this.recommendations, this.currentURL);
                }
            }
        );
        SettingsService.get('autofill.ignored-domains').then(
            (s) => { this._ingoredDomainsSetting = s; }
        );
        SettingsService.get('paste.autofill').then(
            (s) => {
                this._autofillEnabled = s;
                this._enabled = true;
            }
        );
    }

    /**
     *
     * @param {Password[]} recommendations
     * @param {String} url
     * @private
     */
    _sendAutofillPassword(recommendations, url) {
        if(!this._enabled || recommendations.length === 0 || !this._autofillEnabled?.getValue() || this._isIgnoredDomain(url)) return;
        let password = recommendations[0];

        let ids = TabManager.get('autofill.ids', []);
        if(ids.indexOf(password.getId()) === -1) {
            ids.push(password.getId());
            TabManager.set('autofill.ids', ids);
        }

        this._sendPwdToMessageService(password);
    }

    /**
     *
     * @param {Password} password
     * @private
     */
    _sendPwdToMessageService(password) {
        let time = Date.now();
        MessageService.send(
            {
                type    : 'autofill.password',
                receiver: 'client',
                channel : 'tabs',
                tab     : TabManager.currentTabId,
                silent  : true,
                payload : AutofillRequestHelper.createPasteRequest(password, false, true)
            }
        ).catch(ErrorManager.catch);
    }

    _isIgnoredDomain(url) {
        url = Url(url);

        let domains = this._ingoredDomainsSetting?.getValue();
        if(domains.length === 0) return false;

        domains = domains.split(/\r?\n/);
        for(let domain of domains) {
            if(url.host.endsWith(domain.trim())) {
                return true;
            }
        }

        return false;
    }
};
