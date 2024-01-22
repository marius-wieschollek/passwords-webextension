import AbstractController from '@js/Controller/AbstractController';
import SettingsService from '@js/Services/SettingsService';

export default class Get extends AbstractController {

    constructor() {
        super();
        this._readableSettings = [
            'password.generator.strength',
            'password.generator.numbers',
            'password.generator.special',
            'paste.form.submit',
            'paste.popup.close',
            'paste.compromised.warning',
            'paste.autofill',
            'paste.basic-auth',
            'popup.related.search',
            'notification.password.new',
            'notification.password.update',
            'notification.password.quicksave',
            'server.default',
            'theme.current',
            'theme.custom',
            'debug.localisation.enabled',
            'clipboard.clear.delay',
            'clipboard.clear.passwords',
            'search.recommendation.mode',
            'search.recommendation.maxRows',
            'password.list.show.user',
            'mining.ignored-domains',
            'mining.incognito.hide'
        ];
    }

    /**
     *
     * @param {Message} message
     * @param {Message} reply
     * @return {Promise<void>}
     */
    async execute(message, reply) {
        let setting = message.getPayload();

        try {
            if(this._readableSettings.indexOf(setting) !== -1) {
                /** @type {Setting} **/
                let model = await SettingsService.get(setting);
                reply.setType('setting.value').setPayload({value: model.getValue(), scope: model.getScope()});
            } else {
                reply.setPayload(
                    {
                        success: false,
                        message: 'Unknown setting'
                    }
                );
            }
        } catch(e) {
            reply.setPayload(
                {
                    success: false,
                    message: e.message
                }
            );
        }
    }
}