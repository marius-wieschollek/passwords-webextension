import AbstractController from '@js/Controller/AbstractController';
import HiddenFolderHelper from "@js/Helper/HiddenFolderHelper";
import ErrorManager from "@js/Manager/ErrorManager";
import ServerManager from "@js/Manager/ServerManager";
import SettingsService from "@js/Services/SettingsService";
import SystemService from "@js/Services/SystemService";

export default class DebugData extends AbstractController {

    /**
     *
     * @param {Message} message
     * @param {Message} reply
     */
    async execute(message, reply) {
        let errors = [];

        for(let error of ErrorManager.errors) {
            errors.unshift(error);
        }

        reply
            .setType('debug.errors')
            .setPayload(errors);
    }
}