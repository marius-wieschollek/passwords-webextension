import AbstractController from '@js/Controller/AbstractController';
import SystemService from "@js/Services/SystemService";
import StorageService from "@js/Services/StorageService";
import DatabaseService from "@js/Services/DatabaseService";
import ToastService from "@js/Services/ToastService";

export default class Reset extends AbstractController {

    /**
     *
     * @param {Message} message
     * @param {Message} reply
     */
    async execute(message, reply) {
        let database = await DatabaseService.get(DatabaseService.STATISTICS_DATABASE);
        await database.unload();
        window.indexedDB.deleteDatabase(DatabaseService.STATISTICS_DATABASE);

        await SystemService.getBrowserApi().runtime.requestUpdateCheck();
        SystemService.getBrowserApi().runtime.reload();
    }
}