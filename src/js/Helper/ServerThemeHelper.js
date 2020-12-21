import ObjectClone from 'passwords-client/src/Utility/ObjectClone';
import ServerTheme from '@js/Themes/Server';
import Theme from '@js/Models/Theme/Theme';

class ServerThemeHelper {

    /**
     *
     * @param {PasswordsClient} api
     */
    async create(api) {
        let colors = await this._getColors(api);

        /** @type {ServerTheme} **/
        let theme = ObjectClone.clone(ServerTheme);
        theme.id = api.getServer().getId();
        theme.label = api.getServer().getLabel();

        this._setBadgeColors(theme, colors);
        this._setElementColors(colors, theme);
        this._setButtonColors(theme, colors);
        this._setTabColors(theme, colors);

        return new Theme(theme);
    }

    /**
     * @param {Object} theme
     * @param {Object} colors
     * @private
     */
    _setTabColors(theme, colors) {
        theme.colors['tabs-start'] = colors.primary.bg;
        theme.colors['tabs-end'] = this._lighten(colors.primary.bg, 20);
        theme.colors['tabs-fg'] = colors.primary.fg + '80';
        theme.colors['tabs-active-fg'] = colors.primary.fg;
        theme.colors['border'] = this._lighten(colors.background.bg, -14);
    }

    /**
     * @param {Object} theme
     * @param {Object} colors
     * @private
     */
    _setBadgeColors(theme, colors) {
        theme.badge['color-bg'] = colors.primary.bg;
        theme.badge['color-fg'] = colors.primary.fg;
    }

    /**
     * @param {Object} theme
     * @param {Object} colors
     * @private
     */
    _setButtonColors(theme, colors) {
        theme.colors['button-hover-bg'] = colors.primary.bg;
        theme.colors['button-hover-fg'] = colors.primary.fg;
    }

    /**
     * @param {Object} theme
     * @param {Object} colors
     * @private
     */
    _setElementColors(colors, theme) {
        let fgPrimary = parseInt(colors.primary.bg.replace('#', ''), 16) <= 8355711 ? colors.primary.bg:this._lighten(colors.primary.bg, -30);
        theme.colors['element-bg'] = colors.background.bg;
        theme.colors['element-fg'] = this._lighten(colors.background.fg, 30);
        theme.colors['element-hover-bg'] = this._lighten(colors.background.bg, -7);
        theme.colors['element-hover-fg'] = colors.background.fg;
        theme.colors['element-active-bg'] = this._lighten(colors.background.bg, -7);
        theme.colors['element-active-fg'] = fgPrimary;
        theme.colors['element-active-hover-bg'] = this._lighten(colors.background.bg, -7);
        theme.colors['element-active-hover-fg'] = fgPrimary;
    }

    /**
     * @param {PasswordsClient} api
     * @private
     */
    async _getColors(api) {
        /** @type {SettingRepository} */
        let repository = api.getInstance('repository.setting');
        /** @type {SettingCollection} */
        let collection = await repository.findByNames(['server.theme.color.primary', 'server.theme.color.text', 'server.theme.color.background']);
        let textColor = collection.get('theme.color.text').getValue();
        let primaryColor = collection.get('theme.color.primary').getValue();
        let backgroundColor = collection.get('theme.color.background').getValue();
        let backgroundTextColor = backgroundColor === '#ffffff' ? '#000000':'#ffffff';

        return {primary: {bg: primaryColor, fg: textColor}, background: {bg: backgroundColor, fg: backgroundTextColor}};
    }


    /**
     * Taken from https://gist.github.com/renancouto/4675192
     *
     * @param color
     * @param percent
     * @return {string}
     * @private
     */
    _lighten(color, percent) {
        color = color.replace('#', '');
        let num = parseInt(color, 16),
            amt = Math.round(2.55 * percent),
            R   = (num >> 16) + amt,
            B   = (num >> 8 & 0x00FF) + amt,
            G   = (num & 0x0000FF) + amt;

        return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0:R:255) * 0x10000 + (B < 255 ? B < 1 ? 0:B:255) * 0x100 + (G < 255 ? G < 1 ? 0:G:255)).toString(16).slice(1);
    }
}

export default new ServerThemeHelper();