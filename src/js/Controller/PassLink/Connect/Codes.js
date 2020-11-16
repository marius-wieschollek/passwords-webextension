import AbstractController from '@js/Controller/AbstractController';
import RegistryService from '@js/Services/RegistryService';

export default class Codes extends AbstractController {

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
        let action = RegistryService.get('passlink.action.connect');
        reply.setPayload({success: true, codes: action.getCodes()});
    }
}