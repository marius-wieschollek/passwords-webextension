import AbstractController from '@js/Controller/AbstractController';
import MiningManager from '@js/Manager/MiningManager';

export default class Mine extends AbstractController {

    async execute(message, reply) {
        MiningManager.addNewPassword(message.getPayload());
    }
}