import AbstractController from '@js/Controller/AbstractController';
import HiddenFolderHelper from "@js/Helper/HiddenFolderHelper";
import ErrorManager from "@js/Manager/ErrorManager";
import ServerManager from "@js/Manager/ServerManager";

export default class DebugData extends AbstractController {

    /**
     *
     * @param {Message} message
     * @param {Message} reply
     */
    async execute(message, reply) {
        let data = {
            hidden: {id: null},
            errors: ErrorManager.errors
        };

        try {
            let api    = await ServerManager.getDefaultApi(),
                helper = new HiddenFolderHelper();
            data.hidden.id = await helper.getHiddenFolderId(api);
        } catch(e) {
            ErrorManager.logError(e)
        }

        reply
            .setType('debug.data')
            .setPayload(data);
    }
}