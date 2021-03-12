import FormService from '@js/Services/FormService';
import AbstractController from '@js/Controller/AbstractController';
import ErrorManager from "@js/Manager/ErrorManager";

export default class OpenUrl extends AbstractController {

    /**
     *
     * @param {Message} message
     * @param {Message} reply
     */
    async execute(message, reply) {
        try {
            this._openUrl(message.getPayload().url);
            reply.setPayload(true);
        } catch(e) {
            ErrorManager.logError(e)
        }
    }

    /**
     *
     * @param {String} url
     */
    _openUrl(url) {
        var element = document.createElement("a");
        element.setAttribute('href', url);
        document.body.appendChild(element);
        element.click();
    }
}