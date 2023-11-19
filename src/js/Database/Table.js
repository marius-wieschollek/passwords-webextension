import ErrorManager from "@js/Manager/ErrorManager";

export default class Table {

    constructor(db, name) {
        this._db = db;
        this._name = name;
        this._entries = {};
    }

    load() {
        return new Promise((resolve, reject) => {
            let transaction = this._db.transaction([this._name], 'readonly'),
                request     = transaction.objectStore(this._name).getAll();

            request.onerror = reject;
            request.onsuccess = (e) => {
                let entries = e.target.result;
                for (let entry of entries) {
                    this._entries[entry.key] = JSON.parse(entry.value);
                }
                resolve();
            };
        });
    }

    async flush() {
        for (let id in this._entries) {
            await this._writeEntry(id, this._entries[id]);
        }
    }

    get(id) {
        if (this._entries.hasOwnProperty(id)) {
            return this._entries[id];
        }

        return null;
    }

    set(id, value) {
        this._entries[id] = value;

        this._writeEntry(id, value)
            .catch(ErrorManager.catch);
    }

    _writeEntry(key, value) {
        return new Promise((resolve, reject) => {
            let transaction = this._db.transaction([this._name], 'readwrite'),
                request     = transaction.objectStore(this._name).put({key, value: JSON.stringify(value)});

            request.onsuccess = resolve;
            request.onerror = reject;
        });
    }
}