import RecommendationManager from "@js/Manager/RecommendationManager";
import MessageService from "@js/Services/MessageService";
import TabManager from "@js/Manager/TabManager";
import ErrorManager from "@js/Manager/ErrorManager";
import SettingsService from "@js/Services/SettingsService";
import AutofillRequestHelper from "@js/Helper/AutofillRequestHelper";

export default new class AutofillManager {

    constructor() {
        this._recommendationListener = (recommendations) => {
            this.recommendations = recommendations;
            this.currentURL = TabManager.get('url', null);
            this._sendAutofillPassword(this.recommendations)
                .catch(ErrorManager.catch);
        };
        this.recommendations = [];
        this.currentURL = null;
    }

    /**
     *
     */
    async init() {
        RecommendationManager.listen.on(this._recommendationListener);
        MessageService.listen(
            'autofill.page.ready',
            (message) => {
                if(message.payload.hasOwnProperty('url') && message.payload.url === this.currentURL) {
                    this._sendAutofillPassword(this.recommendations);
                }
            }
        );
    }

    /**
     *
     * @param {Password[]} recommendations
     * @private
     */
    async _sendAutofillPassword(recommendations) {
        if(recommendations.length === 0 || await SettingsService.getValue('paste.autofill') === false) return;
        let password = recommendations[0];

        setTimeout(() => {
            let ids = TabManager.get('autofill.ids', []);
            if(ids.indexOf(password.getId()) === -1) {
                ids.push(password.getId());
                TabManager.set('autofill.ids', ids);
            }
            this._sendPwdToMessageService(password);
        }, 500);
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
};
