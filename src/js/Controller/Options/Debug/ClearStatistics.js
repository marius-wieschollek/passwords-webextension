import AbstractController from '@js/Controller/AbstractController';
import SystemService from "@js/Services/SystemService";
import StorageService from "@js/Services/StorageService";
import DatabaseService from "@js/Services/DatabaseService";
import ToastService from "@js/Services/ToastService";
import ErrorManager from "@js/Manager/ErrorManager";

export default class Reset extends AbstractController {

    /**
     *
     * @param {Message} message
     * @param {Message} reply
     */
    async execute(message, reply) {
        try {
            let database = await DatabaseService.get(DatabaseService.STATISTICS_DATABASE);
            await database.unload();
            window.indexedDB.deleteDatabase(DatabaseService.STATISTICS_DATABASE);
        } catch(e) {
            ErrorManager.catch(e);
        }

        await SystemService.requestUpdateCheck();
        SystemService.getBrowserApi().runtime.reload();
    }
}