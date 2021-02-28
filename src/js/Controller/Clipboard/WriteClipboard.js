import ClipboardManager from '@js/Manager/ClipboardManager';
import AbstractController from '@js/Controller/AbstractController';
import ErrorManager from "@js/Manager/ErrorManager";

export default class WriteClipboard extends AbstractController {

    /**
     *
     * @param {Message} message
     * @param {Message} reply
     */
    async execute(message, reply) {
        try {
            let result = ClipboardManager.write(message.getPayload().type, message.getPayload().value);

            if(result) reply.setPayload(true);
        } catch(e) {
            ErrorManager.logError(e)
        }
    }
}
