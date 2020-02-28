import SettingsService from '@js/Services/SettingsService';
import ThemeRepository from '@js/Repositories/ThemeRepository';
import ErrorManager from '@js/Manager/ErrorManager';

class ThemeService {

    async apply() {
        let theme  = await this.getCurrentTheme(),
            colors = theme.getColors();

        for(let color in colors) {
            if(!colors.hasOwnProperty(color)) continue;
            document.documentElement.style.setProperty(`--${color}-color`, colors[color]);
        }
    }

    /**
     *
     * @return {Promise<Theme>}
     */
    async getCurrentTheme() {
        let current = await SettingsService.getValue('theme.current');

        try {
            return await ThemeRepository.findById(current);
        } catch(e) {
            ErrorManager.logError(e);
            return await ThemeRepository.findById('light');
        }
    }
}

export default new ThemeService();