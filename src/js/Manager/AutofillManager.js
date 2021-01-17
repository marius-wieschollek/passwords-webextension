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

        let ids = TabManager.get('autofill.ids', []);
        if(ids.indexOf(password.getId()) === -1) {
            ids.push(password.getId());
            TabManager.set('autofill.ids', ids);
        }

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