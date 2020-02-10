import AbstractController from '@js/Controller/AbstractController';
import SettingsService from '@js/Services/SettingsService';

export default class Get extends AbstractController {

    constructor() {
        super();
        this._readableSettings = [
            'sync.password.autosubmit',
            'sync.server.default'
        ];
        this._settingDefaults = {
            'sync.password.autosubmit': true,
            'sync.server.default'     : null
        };
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
                let value = await SettingsService.getValue(setting, this._settingDefaults[setting]);
                reply.setPayload(value);
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