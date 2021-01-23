class ThemeCssVarsHelper {
    processTheme(theme) {
        let vars = {
            '--color-primary'      : '#0082c9',
            '--color-text'         : '#ffffff',
            '--image-background'   : 'linear-gradient(40deg, #0082c9 0%, #30b6ff 100%)',
            '--image-logo'         : '',
            '--border-radius'      : '3px',
            '--border-radius-large': '10px',
            '--border-radius-pill' : '100px'
        };

        if(theme === null) return vars;
        if(theme.hasOwnProperty('color.primary')) {
            vars['--color-primary'] = theme['color.primary'];
        }
        if(theme.hasOwnProperty('color.text')) {
            vars['--color-text'] = theme['color.text'];
        }
        if(theme.hasOwnProperty('background')) {
            let gradient = 'linear-gradient(40deg, #0082c9 0%, #30b6ff 100%)';

            if(theme['color.primary'] !== '#0082c9') {
                gradient =
                    `linear-gradient(40deg,${theme['color.primary']} 0%,${theme['color.text']} 320%)`;
            }

            vars['--image-background'] =
                `url(${theme['background']}), ${gradient}`;
        }
        if(theme.hasOwnProperty('logo')) {
            vars['--image-logo'] = `url(${theme['logo']})`;
        }

        return vars;
    }
}

export default new ThemeCssVarsHelper();