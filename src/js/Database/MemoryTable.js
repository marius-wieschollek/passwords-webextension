import Table from "@js/Database/Table";

export default class MemoryTable extends Table {

    load() {
        this._entries = {};
    }

    async flush() {
    }

    get(id) {
        if (this._entries.hasOwnProperty(id)) {
            return this._entries[id];
        }

        return null;
    }

    set(id, value) {
        this._entries[id] = value;
    }
}