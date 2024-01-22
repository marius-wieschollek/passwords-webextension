import AbstractController from "@js/Controller/AbstractController";
import SettingsService from "@js/Services/SettingsService";

export default class GetSettings extends AbstractController {
    async execute(message, reply) {
        let payload = message.getPayload();

        await SettingsService.set('paste.autofill', payload?.autofill === true);
        await SettingsService.set('notification.password.quicksave', payload?.quicksave === true);
        await SettingsService.set('mining.incognito.hide', payload?.incognito === true);
        await SettingsService.set('password.folder.private', 'd1145b70-a731-42da-b3b1-163c3113751f');
        await SettingsService.set('setup.initialized', true);
        reply.setType('success');
    }
}