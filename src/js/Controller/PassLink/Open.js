import AbstractController from '@js/Controller/AbstractController';
import SystemService from '@js/Services/SystemService';

export default class Open extends AbstractController{

    /**
     *
     * @param {Message} message
     * @param {Message} reply
     */
    async execute(message, reply) {
        let {action, data} = message.getPayload();

        let url = await SystemService.getBrowserApi().runtime.getURL('html/passlink.html');
        url += '?action=' + encodeURIComponent(action);
        if(data) url += '&data=' + encodeURIComponent(JSON.stringify(data));

        SystemService.getBrowserApi().tabs.create({url})
    }
}