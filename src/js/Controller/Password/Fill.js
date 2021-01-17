import SearchIndex from '@js/Search/Index/SearchIndex';
import MessageService from '@js/Services/MessageService';
import AbstractController from '@js/Controller/AbstractController';
import TabManager from '@js/Manager/TabManager';
import SettingsService from '@js/Services/SettingsService';
import ErrorManager from '@js/Manager/ErrorManager';
import PasswordStatisticsService from "@js/Services/PasswordStatisticsService";
import Message from "@js/Models/Message/Message";

export default class Fill extends AbstractController {

    /**
     *
     * @param {Message} message
     * @param {Message} reply
     */
    async execute(message, reply) {
        /** @type {EnhancedPassword} **/
        let password = SearchIndex.getItem(message.getPayload());

        let ids = TabManager.get('autofill.ids', []);
        if(ids.indexOf(password.getId()) === -1) {
            ids.push(password.getId());
            TabManager.set('autofill.ids', ids);
        }

        PasswordStatisticsService.registerUse(password.getId()).catch(ErrorManager.catchEvt)

        try {
            let response = await MessageService.send(
                {
                    type    : 'autofill.password',
                    receiver: 'client',
                    channel : 'tabs',
                    tab     : TabManager.currentTabId,
                    silent  : true,
                    payload : {
                        user    : password.getUserName(),
                        password: password.getPassword(),
                        submit  : await SettingsService.getValue('paste.form.submit')
                    }
                }
            );

            let success = response instanceof Message ? response.getPayload() === true:false;
            reply.setPayload({success});
        } catch(e) {
            ErrorManager.logError(e);
            reply.setPayload({success: false});
        }
    }
}