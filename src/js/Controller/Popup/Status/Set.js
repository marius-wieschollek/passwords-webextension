import AbstractController from '@js/Controller/AbstractController';
import RegistryService from '@js/Services/RegistryService';

export default class Set extends AbstractController {

    async execute(message, reply) {
        let payload = message.getPayload();

        if(payload.hasOwnProperty('service')) {
            if(!payload.hasOwnProperty('tab')) return;
            RegistryService.set('popup.tab', payload.tab);

            if(payload.hasOwnProperty('data')) {
                RegistryService.set('popup.data', payload.data);
            }
        } else {
            if(!payload.hasOwnProperty('tab')) return;
            RegistryService.set('popup.tab', payload.tab);

            if(payload.hasOwnProperty('status')) {
                RegistryService.set(`popup.${payload.tab}.status`, payload.status);
            }
        }
    }

}