import AbstractController from '@js/Controller/AbstractController';
import SettingsService from '@js/Services/SettingsService';

export default class Get extends AbstractController {

    constructor() {
        super();
        this._readableSettings = [
            'password.autosubmit',
            'server.default'
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
                let value = await SettingsService.getValue(setting);
                reply.setType('setting.value').setPayload(value);
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