import ErrorManager from "@js/Manager/ErrorManager";

export default new class PasswordStatisticsService {

    constructor() {
        this._db = null;
    }

    /**
     * @public
     * @return {Promise<void>}
     */
    async init() {
        if(!window.indexedDB) return;

        return new Promise((resolve, reject) => {
            let request = window.indexedDB.open('pwd_stats', 1);

            request.onerror = (event) => {
                // @TODO use custom error here
                ErrorManager.logError(new Error('Could not open database'), {event});
                resolve();
            };

            request.onupgradeneeded = (event) => {
                let db = event.target.result;
                db.createObjectStore('uses', {keyPath: 'id'});
            };

            request.onsuccess = (event) => {
                this._db = event.target.result;
                resolve();
            };
        });
    }

    /**
     * @public
     * @param {String} id
     * @return {Promise<void>}
     */
    async registerUse(id) {
        if(this._db === null) return;
        let hits = 0;
        if(await this._entryExists(id)) {
            hits = await this._readEntry(id);
        }

        hits++;

        await this._writeEntry(id, hits);
    }

    /**
     * @public
     * @param {String} id
     * @return {Promise<Number>}
     */
    async getUses(id) {
        if(this._db === null) return 0;

        if(await this._entryExists(id)) {
            return await this._readEntry(id);
        }

        return 0;
    }

    /**
     * @param {String} id
     * @return {Promise<Boolean>}
     * @private
     */
    async _entryExists(id) {
        return new Promise((resolve, reject) => {
            let transaction = this._db.transaction(['uses'], 'readonly'),
                count       = transaction.objectStore('uses').count(IDBKeyRange.only(id));

            count.onsuccess = (e) => {
                resolve(e.target.result !== 0);
            };

            count.onerror = reject;
        });
    }

    /**
     * @param {String} id
     * @return {Promise<Number>}
     * @private
     */
    async _readEntry(id) {
        return new Promise((resolve, reject) => {
            let transaction = this._db.transaction(['uses'], 'readonly'),
                read        = transaction.objectStore('uses').get(id);

            read.onsuccess = (e) => {
                resolve(e.target.result.value);
            };

            read.onerror = reject;
        });
    }

    /**
     * @param {String} id
     * @param {Number} value
     * @return {Promise<void>}
     * @private
     */
    async _writeEntry(id, value) {
        return new Promise((resolve, reject) => {
            let transaction = this._db.transaction(['uses'], 'readwrite'),
                write       = transaction.objectStore('uses').put({id, value});

            write.onsuccess = resolve;
            write.onerror = reject;
        });
    }
};