import MessageService from '@js/Services/MessageService';
import AbstractController from '@js/Controller/AbstractController';
import TabManager from '@js/Manager/TabManager';
import ErrorManager from '@js/Manager/ErrorManager';
import Message from "@js/Models/Message/Message";

export default class Fill extends AbstractController {

    /**
     *
     * @param {Message} message
     * @param {Message} reply
     */
    async execute(message, reply) {
        try {
            var url = message.getPayload().url;
            let response = await MessageService.send(
                {
                    type    : 'url.open',
                    receiver: 'client',
                    channel : 'tabs',
                    tab     : TabManager.currentTabId,
                    silent  : true,
                    payload : { 
                        url    : url
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