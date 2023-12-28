import ErrorManager from "@js/Manager/ErrorManager";
import DatabaseService from "@js/Services/DatabaseService";

export default class Migration20006 {


    async sync() {}

    async local() {
        if (!window.indexedDB) return;
        let pwdStatsDb, entries;

        try {
            pwdStatsDb = await this._loadPwStatsDb();
        } catch (e) {
            ErrorManager.logError(e);
            return;
        }

        try {
            entries = await this._readAllEntriesFromDb(pwdStatsDb);
        } catch (e) {
            ErrorManager.logError(e);
            return;
        }

        try {
            let database = await DatabaseService.get(DatabaseService.STATISTICS_DATABASE);
            let table = await database.use(DatabaseService.STATISTICS_PASSWORD_USAGE_TABLE);

            for (let entry of entries) {
                table.set(entry.id, {total: entry.value, domains: {}});
            }

            await table.flush();
        } catch (e) {
            ErrorManager.logError(e);
            return;
        }


        try {
            await this._deleteOldDb(pwdStatsDb);
        } catch (e) {
            ErrorManager.logError(e);
        }
    }

    _loadPwStatsDb() {
        return new Promise((resolve, reject) => {
            let pwd_stats = window.indexedDB.open('pwd_stats', 1);
            pwd_stats.onerror = (e) => {
                reject(e);
            };
            pwd_stats.onupgradeneeded = (event) => {
                let db = event.target.result;
                db.createObjectStore('uses', {keyPath: 'id'});
            };

            pwd_stats.onsuccess = (event) => {
                resolve(event.target.result);
            };
        });
    }

    _readAllEntriesFromDb(database, table = 'uses') {
        return new Promise((resolve, reject) => {
            let transaction = database.transaction([table], 'readonly'),
                request     = transaction.objectStore(table).getAll();

            request.onerror = (e) => {
                reject(e);
            };
            request.onsuccess = (e) => {
                resolve(e.target.result);
            };
        });

    }

    /**
     *
     * @param {IDBDatabase} database
     * @return {Promise<void>}
     * @private
     */
    async _deleteOldDb(database) {
        try {
            database.deleteObjectStore('uses');
            database.close();
            window.indexedDB.deleteDatabase('pwd_stats');
        } catch (e) {
        }
    }
}