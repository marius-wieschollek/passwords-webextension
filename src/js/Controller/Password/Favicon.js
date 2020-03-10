import AbstractController from '@js/Controller/AbstractController';
import SearchIndex from '@js/Search/Index/SearchIndex';
import SystemService from '@js/Services/SystemService';
import ThemeService from '@js/Services/ThemeService';

export default class Favicon extends AbstractController {

    async execute(message, reply) {
        let {password, size} = message.getPayload();

        /** @type {EnhancedPassword} **/
        let model = SearchIndex.getItem(password);

        if(model !== null) {
            reply.setPayload(model.getFaviconUrl(size));
        } else {
            let icon = await ThemeService.getBadgeIcon();
            if(icon === null) {
                icon = await SystemService.getBrowserApi().runtime.getURL('img/passwords-new-dark.svg');
            }
            reply.setPayload(icon);
        }
    }
}