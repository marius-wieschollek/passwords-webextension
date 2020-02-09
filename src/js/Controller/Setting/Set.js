import AbstractController from '@js/Controller/AbstractController';
import SettingsService from '@js/Services/SettingsService';
import ServerRepository from '@js/Repositories/ServerRepository';

export default class Set extends AbstractController {

    async execute(message, reply) {
        let {setting, value} = message.getPayload();

        try {
            if(setting === 'sync.server.default') {
                await this._setDefaultServer(value);
            } else {
                reply.setPayload(
                    {
                        success: false,
                        message: 'Unknown setting'
                    }
                );
                return;
            }

            reply.setPayload({success: true});
        } catch(e) {
            reply.setPayload(
                {
                    success: false,
                    message: e.message
                }
            );
        }
    }

    /**
     *
     * @param {String} value
     * @return {Promise<void>}
     * @private
     */
    async _setDefaultServer(value) {
        await ServerRepository.findById(value);
        await SettingsService.set('sync.server.default', value);
    }
}