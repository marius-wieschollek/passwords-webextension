import AbstractController from '@js/Controller/AbstractController';
import SettingsService from '@js/Services/SettingsService';

export default class Get extends AbstractController {

    async execute(message, reply) {
        let setting = message.getPayload();

        try {
            if(setting === 'sync.server.default') {
                let value = await SettingsService.getValue(setting);
                reply.setPayload(value)
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