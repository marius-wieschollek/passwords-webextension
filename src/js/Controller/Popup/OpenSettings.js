import AbstractController from '@js/Controller/AbstractController';
import SystemService from "@js/Services/SystemService";
import ErrorManager from "@js/Manager/ErrorManager";

export default class OpenSettings extends AbstractController {

    async execute(message, reply) {
        let info = await SystemService.getBrowserInfo(),
            api  = SystemService.getBrowserApi();

        if(info.name === 'Kiwi' || SystemService.isCompatible(SystemService.PLATFORM_FENIX)) {
            let url = api.runtime.getURL('html/options.html') + '?newtab';
            browser.tabs
                   .create({url, active: true})
                   .catch(ErrorManager.catchEvt);
        } else {
            api.runtime.openOptionsPage();
        }
    }
}