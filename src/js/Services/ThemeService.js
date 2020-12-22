import SettingsService from '@js/Services/SettingsService';
import MessageService from '@js/Services/MessageService';
import SystemService from '@js/Services/SystemService';
import ErrorManager from '@js/Manager/ErrorManager';

class ThemeService {

    get FONT_SIZE_MAPPING() {
        return this._fontSizes;
    }

    get FONT_FAMILY_MAPPING() {
        return {
            default  : '-apple-system, BlinkMacSystemFont, Ubuntu, Calibri, "Helvetica Neue", sans-serif',
            mono     : 'FreeMono, "Courier New", monospace',
            sans     : 'Ubuntu, Calibri, "Helvetica Neue", sans-serif',
            serif    : '"Times New Roman", Numbus, serif',
            light    : '"Comfortaa Light","Lato Light","Corbel Light","Gill Sans Light", sans-serif-thin, sans-serif-light',
            nextcloud: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
            dyslexic : 'OpenDyslexic, Dyslexie, sans-serif'
        };
    }

    constructor() {
        /** @type {(ThemeRepository|null)} **/
        this._repository = null;
        this._style = null;
        this._fontSizes = {
            'xs': '8pt',
            's' : '10pt',
            'd' : '11pt',
            'm' : '12pt',
            'l' : '14pt',
            'xl': '16pt'
        };

        SystemService.getBrowserInfo().then((d) => {
            if(d.device === 'mobile') {
                this._fontSizes = {
                    'xs': '10pt',
                    's' : '12pt',
                    'd' : '12.5pt',
                    'm' : '13pt',
                    'l' : '16pt',
                    'xl': '18pt'
                };
            }
        })
    }

    /**
     *
     * @param {ThemeRepository} repository
     */
    init(repository) {
        this._repository = repository;
    }

    async getBadgeIcon() {
        let theme = await this.getCurrentTheme(),
            icon  = theme.getBadgeIcon();

        if(!icon) return null;

        if(SystemService.getBrowserPlatform() === 'firefox') {
            return await SystemService.getBrowserApi().runtime.getURL(`img/${icon}.svg`);
        }
        return await SystemService.getBrowserApi().runtime.getURL(`img/${icon}.png`);
    }

    async getBadgeTextColor() {
        let theme = await this.getCurrentTheme();

        return theme.getBadgeForegroundColor();
    }

    async getBadgeBackgroundColor() {
        let theme = await this.getCurrentTheme();

        return theme.getBadgeBackgroundColor();
    }

    async apply() {
        let theme = await this.getCurrentTheme();
        this.applyTheme(theme);
    }

    /**
     *
     * @param {Theme} theme
     */
    applyTheme(theme) {
        this._createStyleSheet(
            theme,
            this._applyFont(theme.getFont()),
            this._applyColors(theme.getColors()),
            this._applyVariables(theme.getVariables())
        );
    }

    /**
     *
     * @return {Promise<Theme>}
     */
    async getCurrentTheme() {
        let current = await SettingsService.getValue('theme.current');

        if(this._repository !== null) {
            try {
                return await this._repository.findById(current);
            } catch(e) {
                ErrorManager.logError(e);
                return await this._repository.findById('light');
            }
        }

        let reply = await MessageService.send({type: 'theme.show', payload: current});
        if(reply.getType() === 'theme.item') return reply.getPayload();

        reply = await MessageService.send({type: 'theme.show', payload: 'light'});
        return reply.getPayload();
    }

    /**
     *
     * @param {Object} colors
     * @return {{}}
     * @private
     */
    _applyColors(colors) {
        if(!colors) return {};

        let css = {};
        for(let color in colors) {
            if(!colors.hasOwnProperty(color)) continue;
            css[`--${color}-color`] = colors[color];
        }

        for(let toast of ['info', 'success', 'warning', 'error']) {
            let color = `${toast}-fg`;
            if(colors.hasOwnProperty(color)) {
                css[`--${toast}-hv-color`] = `${colors[color]}40`;
            }
        }

        return css;
    }

    /**
     *
     * @param {Object} font
     * @return {{}}
     * @private
     */
    _applyFont(font) {
        if(!font) return {};

        let css = {};
        if(font.hasOwnProperty('family') && font.family) {
            let mapping = this.FONT_FAMILY_MAPPING;

            if(mapping.hasOwnProperty(font.family)) {
                css['--font-family'] = mapping[font.family];
            } else {
                css['--font-family'] = font.family;
            }
        }

        if(font.hasOwnProperty('size') && font.size) {
            let mapping = this.FONT_SIZE_MAPPING;
            if(mapping.hasOwnProperty(font.size)) {
                css['--font-size'] = mapping[font.size];
            } else {
                css['--font-size'] = font.size;
            }
        }

        return css;
    }

    /**
     *
     * @param {Object} variables
     * @return {{}}
     * @private
     */
    _applyVariables(variables) {
        if(!variables) return {};

        let css = {};
        for(let variable in variables) {
            if(!variables.hasOwnProperty(variable)) continue;
            css[`--${variable}`] = variables[variable];
        }

        return css;
    }

    /**
     *
     * @param {Theme} theme
     * @param {Object} variables
     * @private
     */
    _createStyleSheet(theme, ...variables) {
        let css = '';
        variables = Object.assign(...variables);
        for(let variable in variables) {
            if(!variables.hasOwnProperty(variable)) continue;

            let value = variables[variable].replace(';', ''),
                key   = variable.replace(';', '');

            css += `${key}: ${value};`;
        }

        css = `:root { ${css} }`;
        if(theme.getStyle()) css = `@import url("/css/themes/${theme.getId()}.css");\n${css}`;
        if(theme.getType() === 'server') css = `@import url("/css/themes/server.css");\n${css}`;

        if(this._style === null) {
            this._style = document.createElement('style');
            this._style.setAttribute('type', 'text/css');
            document.body.appendChild(this._style);
        }

        this._style.innerHTML = css;
    }
}

export default new ThemeService();