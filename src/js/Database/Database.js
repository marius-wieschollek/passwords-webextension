import BooleanState from 'passwords-client/boolean-state';
import ErrorManager from "@js/Manager/ErrorManager";
import Table from "@js/Database/Table";

export default class Database {

    get ready() {
        return this._ready;
    }

    constructor(name, version, upgradeCallback = null) {
        this._name = name;
        this._version = version;
        this._upgradeCallback = upgradeCallback;
        this._ready = new BooleanState(false);
        this._db = null;
    }

    load() {
        let request = window.indexedDB.open(this._name, this._version);

        request.onerror = (event) => {
            // @TODO use custom error here
            ErrorManager.logError(new Error('Could not open database'), {event});
        };

        request.onupgradeneeded = (event) => {
            let db = event.target.result;

            if (this._upgradeCallback) {
                this._upgradeCallback(db, event);
            }
        };

        request.onsuccess = (event) => {
            this._db = event.target.result;
            this._ready.set(true);
        };
    }

    /**
     * @param {String} name
     * @return {Promise<Table>}
     */
    async use(name) {
        if (!this._ready.get()) {
            await this._ready.awaitTrue();
        }

        let table = new Table(this._db, name);
        await table.load();
        return table;
    }
}