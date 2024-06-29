import Database from "@js/Database/Database";
import MemoryDatabase from "@js/Database/MemoryDatabase";
import ErrorManager from "@js/Manager/ErrorManager";

export default new class DatabaseService {


    get STATISTICS_PASSWORD_USAGE_TABLE() {
        return 'passwordUsage';
    }

    get STATISTICS_DATABASE() {
        return 'statistics';
    }

    constructor() {
        this._databases = {};
        this._canUsePersistentDb = null;
    }


    /**
     * @param {String} name
     * @return {Promise<Database>}
     */
    async get(name) {
        if(this._databases.hasOwnProperty(name)) {
            return this._databases[name];
        }

        let database;
        if(name === this.STATISTICS_DATABASE) {
            database = await this._getStatisticsDatabase();
        } else {
            database = await this._makeDatabase(name, 1, () => {});
        }
        await database.load();
        this._databases[name] = database;
        return database;
    }

    _getStatisticsDatabase() {
        return this._makeDatabase(
            this.STATISTICS_DATABASE,
            1,
            (db, event) => {
                db.createObjectStore(this.STATISTICS_PASSWORD_USAGE_TABLE, {keyPath: 'key'});
            }
        );
    }

    async _makeDatabase(...properties) {
        if(await this._canUsePersistent()) {
            return new Database(...properties);
        }
        return new MemoryDatabase(...properties);
    }

    _canUsePersistent() {
        return new Promise((resolve) => {
            if(this._canUsePersistentDb !== null) {
                resolve(this._canUsePersistentDb);
                return;
            }

            let testDb = indexedDB.open('always_private_test');
            testDb.onerror = () => {
                this._canUsePersistentDb = false;
                resolve(false);
                ErrorManager.warning('Persistent database not available. Maybe always private browsing is enabled?')
            };
            testDb.onsuccess = () => {
                this._canUsePersistentDb = true;
                resolve(true);
            };
        });
    }
};