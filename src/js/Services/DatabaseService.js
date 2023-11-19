import Database from "@js/Database/Database";

export default new class DatabaseService {


    get STATISTICS_PASSWORD_USAGE_TABLE() {
        return 'passwordUsage';
    }

    get STATISTICS_DATABASE() {
        return 'statistics';
    }

    constructor() {
        this._databases = {};
    }


    /**
     * @param {String} name
     * @return {Promise<Database>}
     */
    async get(name) {
        if (this._databases.hasOwnProperty(name)) {
            return this._databases[name];
        }

        let database;
        if (name === this.STATISTICS_DATABASE) {
            database = this._getStatisticsDatabase();
        } else {
            database = new Database(name, 1, () => {
            });
        }
        await database.load();
        return database;
    }

    _getStatisticsDatabase() {
        return new Database(
            this.STATISTICS_DATABASE,
            1,
            (db, event) => {
                db.createObjectStore(this.STATISTICS_PASSWORD_USAGE_TABLE, {keyPath: 'key'});
            }
        );
    }
};