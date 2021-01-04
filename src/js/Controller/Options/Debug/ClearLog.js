import AbstractController from '@js/Controller/AbstractController';
import ErrorManager from "@js/Manager/ErrorManager";

export default class FetchLog extends AbstractController {

    /**
     *
     * @param {Message} message
     * @param {Message} reply
     */
    async execute(message, reply) {
        ErrorManager.clearLog();
        reply.setPayload({success: true});
    }
}