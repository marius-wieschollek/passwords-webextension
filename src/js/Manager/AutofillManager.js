import RecommendationManager from "@js/Manager/RecommendationManager";
import MessageService from "@js/Services/MessageService";
import TabManager from "@js/Manager/TabManager";
import ErrorManager from "@js/Manager/ErrorManager";
import SettingsService from "@js/Services/SettingsService";

export default new class AutofillManager {

    constructor() {
        this._recommendationListener = (recommendations) => {
            this.recommendations = recommendations;
            this.currentURL = TabManager.getAll()[TabManager.currentTabId].url;
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
            (message, reply) => {
                if(message.url === this.currentURL) {
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
                    user      : password.getUserName(),
                    password  : password.getPassword(),
                    formFields: this.getCustomFormFields(password),
                    submit    : false
                }
            }
        ).catch(ErrorManager.catchEvt);
    }

    /**
     *
     * @param {Password} password
     * @returns {Array}
     */
    getCustomFormFields(password) {
        let formFields = [],
            customFields = password.getCustomFields();

        customFields._elements.forEach((e) => {
            if(e.getType() === 'data' && e.getLabel().startsWith('ext:field/')) {
                formFields.push(
                    {
                        id   : e.getLabel().replace('ext:field/', ''),
                        value: e.getValue()
                    }
                );
            }
        });

        return formFields;
    }
};
