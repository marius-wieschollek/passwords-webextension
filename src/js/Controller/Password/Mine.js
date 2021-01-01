import AbstractController from '@js/Controller/AbstractController';
import MiningManager from '@js/Manager/MiningManager';
import ErrorManager from "@js/Manager/ErrorManager";

export default class Mine extends AbstractController {

    async execute(message, reply) {
        MiningManager
            .addPassword(message.getPayload())
            .catch(ErrorManager.catchEvt);
    }
}