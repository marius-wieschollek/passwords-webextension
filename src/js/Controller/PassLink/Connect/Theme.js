import AbstractController from '@js/Controller/AbstractController';
import ThemeCssVarsHelper from '@js/Helper/ThemeCssVarsHelper';
import RegistryService from '@js/Services/RegistryService';

export default class Theme extends AbstractController {

    /**
     *
     * @param {Message} message
     * @param {Message} reply
     */
    async execute(message, reply) {
        if(!RegistryService.has('passlink.action.connect')) {
            reply.setPayload({success: false, message: 'PasslinkNoActiveAction'});
        }

        /** @type Connect **/
        let action = RegistryService.get('passlink.action.connect'),
            theme  = await action.getTheme(),
            vars   = ThemeCssVarsHelper.processTheme(theme);
        reply.setPayload({success: true, theme, vars});
    }
}