import SystemService from "@js/Services/SystemService";

class LocalisationService {

    constructor() {
        this._browser = SystemService.getBrowserApi();
    }

    /**
     *
     * @param {(String|String[])} key
     * @param {(String|String[])} [variables]
     * @returns {String}
     */
    translate(key, ...variables ) {
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