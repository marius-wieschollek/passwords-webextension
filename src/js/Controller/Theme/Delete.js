import AbstractController from '@js/Controller/AbstractController';
import ThemeRepository from '@js/Repositories/ThemeRepository';
import ThemeService from "@js/Services/ThemeService";
import SettingsService from "@js/Services/SettingsService";

export default class Delete extends AbstractController {

    async execute(message, reply) {
        let themeId = message.getPayload().id;

        let currentTheme = await ThemeService.getCurrentTheme();
        if(currentTheme.getId() === themeId) {
            let defaultTheme = await ThemeRepository.findById('light');
            ThemeService.applyTheme(defaultTheme);
            await SettingsService.reset('theme.current');
        }

        await ThemeRepository.delete(themeId);
        reply.setPayload({success: true});
    }
}