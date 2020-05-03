import AbstractController from '@js/Controller/AbstractController';
import TabManager from '@js/Manager/TabManager';

export default class Codes extends AbstractController {

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
        let action = TabManager.get('passlink.action.connect');
        reply.setPayload({success: true, codes: action.getCodes()});
    }
}