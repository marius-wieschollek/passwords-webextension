import Database from "@js/Database/Database";
import MemoryTable from "@js/Database/MemoryTable";

export default class MemoryDatabase extends Database {

    async load() {
        this._db = {};
        this._tables = {};
        this._ready.set(true);
    }

    async unload() {
        if (!this._ready.get()) {
            await this._ready.awaitTrue();
        }
        this._db = null;
        this._tables = {};
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

        let table = new MemoryTable(this._db, name);
        await table.load();
        this._tables[name] = table;
        return table;
    }
}