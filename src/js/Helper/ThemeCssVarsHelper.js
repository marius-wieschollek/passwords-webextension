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
        if(theme.hasOwnProperty('colors')) {
            if(theme.colors.hasOwnProperty('primary')) {
                vars['--color-primary'] = theme.colors.primary;
            }
            if(theme.colors.hasOwnProperty('text')) {
                vars['--color-text'] = theme.colors.text;
            }
        }
        if(theme.hasOwnProperty('color.primary')) {
            vars['--color-primary'] = theme['color.primary'];
        }
        if(theme.hasOwnProperty('color.text')) {
            vars['--color-text'] = theme['color.text'];
        }
        if(theme.hasOwnProperty('background')) {
            if(vars['--color-primary'] !== '#0082c9') {
                vars['--image-background'] = `linear-gradient(40deg,${vars['--color-primary']} 0%,${vars['--color-text']} 320%)`;
            }

            vars['--image-background'] =
                `url(${theme.background}), ${vars['--image-background']}`;
        }
        if(theme.hasOwnProperty('logo')) {
            vars['--image-logo'] = `url(${theme.logo})`;
        }

        return vars;
    }
}

export default new ThemeCssVarsHelper();