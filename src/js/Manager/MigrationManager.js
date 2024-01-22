import SystemService from '@js/Services/SystemService';
import Migration20000 from "@js/Migrations/Migration20000";
import Migration20001 from "@js/Migrations/Migration20001";
import Migration20002 from "@js/Migrations/Migration20002";
import Migration20003 from "@js/Migrations/Migration20003";
import Migration20004 from "@js/Migrations/Migration20004";
import Migration20005 from "@js/Migrations/Migration20005";
import ErrorManager from "@js/Manager/ErrorManager";
import Migration20006 from "@js/Migrations/Migration20006";

export default new class MigrationManager {

    get CURRENT_VERSION() {
        return 20006;
    }

    async run() {
        let storage = SystemService.getBrowserApi().storage;
        for(let area of ['sync', 'local']) {
            let result = await storage[area].get('version');

            if(!result.hasOwnProperty('version')) {
                await storage[area].clear();
                await storage[area].set({version: this.CURRENT_VERSION});
                continue;
            }
            if(result.version >= this.CURRENT_VERSION) {
                continue;
            }

            await this._runMigrations(result.version, area);
            await storage[area].set({version: this.CURRENT_VERSION});
        }
    }

    /**
     * @param {Number} version
     * @param {String} area
     *
     * @returns {Promise<void>}
     * @private
     */
    async _runMigrations(version, area) {
        if(version < 20000) {
            await this._runMigration(new Migration20000(), area);
        }

        // Must be here as it changes the settings data structure
        if(version < 20004) {
            await this._runMigration(new Migration20004(), area);
        }

        if(version < 20001) {
            await this._runMigration(new Migration20001(), area);
        }

        if(version < 20002) {
            await this._runMigration(new Migration20002(), area);
        }

        if(version < 20003) {
            await this._runMigration(new Migration20003(), area);
        }

        if(version < 20005) {
            await this._runMigration(new Migration20005(), area);
        }

        if(version < 20006) {
            await this._runMigration(new Migration20006(), area);
        }
    }


    /**
     *
     * @param migration
     * @param {String} area
     * @returns {Promise<void>}
     * @private
     */
    async _runMigration(migration, area) {
        try {
            await migration[area]();
        } catch(e) {
            ErrorManager.logError(e);
        }
    }
};