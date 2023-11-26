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
        let version = await this._getCurrentVersion(storage);

        if(version === null) {
            await storage.sync.set({version: this.CURRENT_VERSION});
            return;
        } else if(version === this.CURRENT_VERSION) {
            return;
        }

        if(version < 20000) {
            await this._runMigration(new Migration20000());
        }

        // Must be here as it changes the settings data structure
        if(version < 20004) {
            await this._runMigration(new Migration20004());
        }

        if(version < 20001) {
            await this._runMigration(new Migration20001());
        }

        if(version < 20002) {
            await this._runMigration(new Migration20002());
        }

        if(version < 20003) {
            await this._runMigration(new Migration20003());
        }

        if(version < 20005) {
            await this._runMigration(new Migration20005());
        }

        if(version < 20006) {
            await this._runMigration(new Migration20006());
        }

        await this._setVersion(storage);
    }

    /**
     *
     * @param storage
     * @returns {Promise<void>}
     * @private
     */
    async _setVersion(storage) {
        await storage.sync.set({version: this.CURRENT_VERSION});
        await storage.local.set({version: this.CURRENT_VERSION});
    }

    /**
     *
     * @param storage
     * @returns {Promise<null>}
     * @private
     */
    async _getCurrentVersion(storage) {
        let version = null,
            result  = await storage.local.get('version');

        if(result.hasOwnProperty('version')) {
            version = result.version;
        } else {
            result = await storage.sync.get('version');
            if(result.hasOwnProperty('version')) version = result.version;
        }
        return version;
    }

    /**
     *
     * @param migration
     * @returns {Promise<void>}
     * @private
     */
    async _runMigration(migration) {
        try {
            await migration.run();
        } catch(e) {
            ErrorManager.logError(e);
        }
    }
};