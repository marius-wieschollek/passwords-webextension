import AbstractController from "@js/Controller/AbstractController";
import SettingsService from "@js/Services/SettingsService";

export default class GetSettings extends AbstractController {
    async execute(message, reply) {
        reply.setPayload(
            {
                autofill: await SettingsService.getValue('paste.autofill'),
                quicksave   : await SettingsService.getValue('notification.password.quicksave'),
                incognito   : await SettingsService.getValue('mining.incognito.hide')
            }
        );
    }
}