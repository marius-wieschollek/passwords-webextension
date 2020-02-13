import AbstractController from '@js/Controller/AbstractController';
import SearchIndex from '@js/Search/Index/SearchIndex';
import SystemService from '@js/Services/SystemService';

export default class Favicon extends AbstractController {

    async execute(message, reply) {
        let {password, size} = message.getPayload();

        /** @type {EnhancedPassword} **/
        let model = SearchIndex.getItem(password);

        if(model !== null) {
            reply.setPayload(model.getFaviconUrl(size))
        } else {
            let icon = await SystemService.getBrowserApi().runtime.getURL('img/passwords.svg');
            reply.setPayload(icon)
        }
    }
}