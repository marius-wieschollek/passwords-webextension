import SystemService from "@js/Services/SystemService";
import SettingsService from "@js/Services/SettingsService";

class LocalisationService {

    constructor() {
        this._browser = SystemService.getBrowserApi();
        this._debug = null;
    }

    /**
     *
     */
    init() {
        SettingsService
            .get('debug.localisation.enabled')
            .then((s) => {
                this._debug = s;
            });
    }

    /**
     *
     * @param {(String|String[])} key
     * @param {(String|String[])} [variables]
     * @returns {String}
     */
    translate(key, ...variables) {
        if(this._debug && !this._debug.getValue()) return key;
        if(Array.isArray(key)) {
            if(key.length < 0) return '';

            variables = key.slice(1);
            key = key.slice(0, 1)[0];
        }
        if(Array.isArray(variables[0])) variables = variables[0];
        let translation = this._browser.i18n.getMessage(key, variables);

        return translation ? translation:key;
    }
}

export default new LocalisationService();