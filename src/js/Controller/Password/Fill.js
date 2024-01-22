import MessageService from '@js/Services/MessageService';
import AbstractController from '@js/Controller/AbstractController';
import TabManager from '@js/Manager/TabManager';
import SettingsService from '@js/Services/SettingsService';
import ErrorManager from '@js/Manager/ErrorManager';
import Message from "@js/Models/Message/Message";
import PasswordStatisticsService from "@js/Services/PasswordStatisticsService";
import Url from "url-parse";
import SearchService from "@js/Services/SearchService";
import AutofillRequestHelper from "@js/Helper/AutofillRequestHelper";

export default class Fill extends AbstractController {

    /**
     *
     * @param {Message} message
     * @param {Message} reply
     */
    async execute(message, reply) {
        /** @type {EnhancedPassword} **/
        let password = SearchService.get(message.getPayload());

        let ids = TabManager.get('autofill.ids', []);
        if(ids.indexOf(password.getId()) === -1) {
            ids.push(password.getId());
            TabManager.set('autofill.ids', ids);
        }

        let url = Url(TabManager.get('url'));
        PasswordStatisticsService.registerPasswordUse(password.getId(), url.host);

        try {
            let response = await MessageService.send(
                {
                    type    : 'autofill.password',
                    receiver: 'client',
                    channel : 'tabs',
                    tab     : TabManager.currentTabId,
                    silent  : true,
                    payload : await this._createPasteRequest(password)
                }
            );

            let success = response instanceof Message ? response.getPayload() === true:false;
            reply.setPayload({success});
        } catch(e) {
            ErrorManager.logError(e);
            reply.setPayload({success: false});
        }
    }

    async _createPasteRequest(password) {
        return AutofillRequestHelper
            .createPasteRequest(
                password,
                await SettingsService.getValue('paste.form.submit')
            );
    }
}