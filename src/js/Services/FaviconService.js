import SearchIndex from "@js/Search/Index/SearchIndex";
import BlobToBase64Helper from "@js/Helper/BlobToBase64Helper";
import ErrorManager from "@js/Manager/ErrorManager";
import ThemeService from "@js/Services/ThemeService";
import SystemService from "@js/Services/SystemService";
import {EnhancedPassword} from "passwords-client/models";

export default new class FaviconService {

    constructor() {
        this._faviconCache = {};
        this._keyHistory = [];
    }

    /**
     * @param {(String|EnhancedPassword)} password
     * @param {Number} size
     * @param {Boolean} withDefault
     * @returns {Promise<String>}
     */
    async getFaviconForPassword(password, size, withDefault = true) {
        let model = null;
        if(password instanceof EnhancedPassword) {
            model = password;
            password = password.getId();
        }

        let key = `${password}_${size}`;
        if(this._faviconCache.hasOwnProperty(key)) {
            return this._faviconCache[key];
        }

        if(model === null) {
            /** @type {EnhancedPassword} **/
            model = SearchIndex.getItem(password);
        }

        if(model !== null) {
            try {
                let blob = await model.getFavicon(size),
                    icon = await BlobToBase64Helper.convert(blob);

                this._putIntoCache(key, icon);

                return icon;
            } catch(e) {
                ErrorManager.logError(e);
                return withDefault ? null:await this._getDefaultIcon();
            }
        }

        return withDefault ? null:await this._getDefaultIcon();
    }

    /**
     *
     * @returns {Promise<String>}
     * @private
     */
    async _getDefaultIcon() {
        let icon = await ThemeService.getBadgeIcon();
        if(icon === null) {
            icon = await SystemService.getBrowserApi().runtime.getURL('img/passwords-new-dark.svg');
        }
        return icon;
    }

    /**
     * @param {String} id
     * @param {String} data
     * @private
     */
    _putIntoCache(id, data) {
        if(Object.keys(this._faviconCache).length > 256) {
            do {
                let key = this._keyHistory.shift();
                if(this._faviconCache.hasOwnProperty(key)) {
                    delete this._faviconCache[key];
                }
            } while(Object.keys(this._faviconCache).length > 256);
        }

        this._faviconCache[id] = data;
        this._keyHistory.push(id);
    }
};