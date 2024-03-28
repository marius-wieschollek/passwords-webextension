import DatabaseService from "@js/Services/DatabaseService";
import {emit} from "@js/Event/Events";
import AutofillManager from "@js/Manager/AutofillManager";

export default new class PasswordStatisticsService {

    constructor() {
        this._table = null;
    }

    /**
     * @public
     * @return {Promise<void>}
     */
    async init() {
        let database = await DatabaseService.get(DatabaseService.STATISTICS_DATABASE);
        this._table = await database.use(DatabaseService.STATISTICS_PASSWORD_USAGE_TABLE);
    }

    /**
     * @public
     * @param {String} id
     * @param {(String|null)} domain
     * @return {void}
     */
    registerPasswordUse(id, domain = null) {
        let entry = this._table.get(id);

        if (entry === null) {
            entry = {total: 0, domains: {}};
        }
        entry.total++;

        if (domain !== null) {
            if (!entry.domains.hasOwnProperty(domain)) {
                entry.domains[domain] = 0;
            }
            entry.domains[domain]++;
        }

        this._table.set(id, entry);
        AutofillManager.toggle(false);
        emit('password:statistics:updated', {id, entry});
        AutofillManager.toggle(true);
    }

    /**
     * @public
     * @param {String} id
     * @return {Object}
     */
    getPasswordUses(id) {
        let entry = this._table.get(id);

        if (entry === null) {
            return {total: 0, domains: {}};
        }

        return entry;
    }
};