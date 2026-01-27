import AbstractController from '@js/Controller/AbstractController';
import MiningManager from '@js/Manager/MiningManager';
import ErrorManager from "@js/Manager/ErrorManager";
import SettingsService from "@js/Services/SettingsService";

export default class Mine extends AbstractController {

    async execute(message, reply) {
        let enabled = await SettingsService.getValue('mining.mining.enabled');

        if(enabled) {
            MiningManager
                .addPassword(message.getPayload())
                .catch(ErrorManager.catch);
        }
    }
}