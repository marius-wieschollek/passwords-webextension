import RecommendationManager from "@js/Manager/RecommendationManager";
import MessageService from "@js/Services/MessageService";
import TabManager from "@js/Manager/TabManager";
import ErrorManager from "@js/Manager/ErrorManager";
import SettingsService from "@js/Services/SettingsService";

export default new class AutofillManager {

    constructor() {
        this._recommendationListener = (recommendations) => {
            this._sendAutofillPassword(recommendations);
        };
        this._sendPasswordToMessageService = (recommendations) => {
            this._sendPwdToMessageService(recommendations);
        };
    }

    /**
     *
     */
    init() {
        RecommendationManager.listen.on(this._recommendationListener);
    }

    /**
     *
     * @param {Password[]} recommendations
     * @private
     */
    async _sendAutofillPassword(recommendations) {
        if(recommendations.length === 0 || await SettingsService.getValue('paste.autofill') === false) return;
        let password = recommendations[0];
        var self = this;

        setTimeout(function () {
            let ids = TabManager.get('autofill.ids', []);
            if(ids.indexOf(password.getId()) === -1) {
                ids.push(password.getId());
                TabManager.set('autofill.ids', ids);
            }
            self._sendPasswordToMessageService(password);
        }, 2500);
    }

    /**
     *
     * @param {Password[]} recommendations
     * @private
     */
    _sendPwdToMessageService(password) {
        MessageService.send(
            {
                type    : 'autofill.password',
                receiver: 'client',
                channel : 'tabs',
                tab     : TabManager.currentTabId,
                silent  : true,
                payload : {
                    user    : password.getUserName(),
                    password: password.getPassword(),
                    submit  : false
                }
            }
        ).catch(ErrorManager.catchEvt);
    }
};
