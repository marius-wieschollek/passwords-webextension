import AbstractController from '@js/Controller/AbstractController';
import TabManager from '@js/Manager/TabManager';
import ThemeCssVarsHelper from '@js/Helper/ThemeCssVarsHelper';

export default class Theme extends AbstractController {

    /**
     *
     * @param {Message} message
     * @param {Message} reply
     */
    async execute(message, reply) {
        if(!TabManager.has('passlink.action.connect')) {
            reply.setPayload({success: false, message: 'PasslinkNoActiveAction'});
        }

        /** @type Connect **/
        let action = TabManager.get('passlink.action.connect'),
            theme  = await action.getTheme(),
            vars   = ThemeCssVarsHelper.processTheme(theme);
        reply.setPayload({success: true, theme, vars});
    }
}