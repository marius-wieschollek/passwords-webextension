import AbstractController from '@js/Controller/AbstractController';
import HiddenFolderHelper from "@js/Helper/HiddenFolderHelper";
import ErrorManager from "@js/Manager/ErrorManager";
import ServerManager from "@js/Manager/ServerManager";
import SettingsService from "@js/Services/SettingsService";

export default class DebugData extends AbstractController {

    /**
     *
     * @param {Message} message
     * @param {Message} reply
     */
    async execute(message, reply) {
        let data = {
            hidden  : {id: null},
            errors  : ErrorManager.errors,
            settings: {localisations: false}
        };

        try {
            let api    = await ServerManager.getDefaultApi(),
                helper = new HiddenFolderHelper();
            data.hidden.id = await helper.getHiddenFolderId(api);
        } catch(e) {
            ErrorManager.logError(e);
        }

        try {
            let value = await SettingsService.getValue('debug.localisation.enabled');
            data.settings.localize = !value;
        } catch(e) {
            ErrorManager.logError(e);
        }

        reply
            .setType('debug.data')
            .setPayload(data);
    }
}