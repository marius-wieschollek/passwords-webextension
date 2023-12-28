import AbstractController from '@js/Controller/AbstractController';
import MessageService from "@js/Services/MessageService";
import TabManager from "@js/Manager/TabManager";
import ErrorManager from "@js/Manager/ErrorManager";

export default class DebugLoginForms extends AbstractController {
    async execute(message, reply) {
        MessageService.send({type: 'debug.form.fields', receiver: 'client', channel: 'tabs', tab: TabManager.currentTabId})
                      .catch(ErrorManager.catch);
    }
}