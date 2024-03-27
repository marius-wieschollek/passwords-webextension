import BooleanState from 'passwords-client/boolean-state';
import ErrorManager from "@js/Manager/ErrorManager";
import Table from "@js/Database/Table";
import CouldNotOpenIndexedDbError from "@js/Exception/CouldNotOpenIndexedDbError";

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
        this._tables = {};
    }

    load() {
        let request = window.indexedDB.open(this._name, this._version);

        request.onerror = (event) => {
            ErrorManager.logError(new CouldNotOpenIndexedDbError(this._name, this._version, request.error), {event});
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

        return this._ready.awaitTrue();
    }

    async unload() {
        if (!this._ready.get()) {
            await this._ready.awaitTrue();
        }
        this._tables = {};
        this._db.close();
        this._ready.set(false);
    }

    /**
     * @param {String} name
     * @return {Promise<Table>}
     */
    async use(name) {
        if (!this._ready.get()) {
            await this._ready.awaitTrue();
        }

        if(this._tables.hasOwnProperty(name)) {
            return this._tables[name];
        }

        let table = new Table(this._db, name);
        await table.load();
        this._tables[name] = table;
        return table;
    }
}