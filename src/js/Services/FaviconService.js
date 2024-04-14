import ErrorManager from "@js/Manager/ErrorManager";
import ThemeService from "@js/Services/ThemeService";
import SystemService from "@js/Services/SystemService";
import {EnhancedPassword} from "passwords-client/models";
import SearchService from "@js/Services/SearchService";
import BlobToBase64Helper from "@js/Helper/BlobToBase64Helper";

export default new class FaviconService {

    constructor() {
        this._faviconCache = {};
        this._queue = {};
        this._keyHistory = [];
    }

    /**
     * @param {(String|EnhancedPassword)} password
     * @param {Number} size
     * @param {Boolean} withDefault
     * @returns {Promise<String>}
     */
    async getFaviconForPassword(password, size, withDefault = true) {
        /** @type {(EnhancedPassword|null)} **/
        let model = password instanceof EnhancedPassword ? password:SearchService.get(password);

        if(model === null || model.getHost() === null) {
            return withDefault ? await this._getDefaultIcon():null;
        }

        let key = `${model.getHost()}_${size}_${withDefault ? '1':'0'}`;
        if(this._faviconCache.hasOwnProperty(key)) {
            return this._faviconCache[key];
        }
        if(this._queue.hasOwnProperty(key)) {
            return await this._queue[key];
        }

        this._queue[key] = new Promise(async (resolve) => {
            try {
                let blob = await model.getFavicon(size),
                    icon = await BlobToBase64Helper.convert(blob);

                this._putIntoCache(key, icon);

                resolve(icon);
            } catch(e) {
                ErrorManager.logError(e);
            }
            resolve(withDefault ? await this._getDefaultIcon():null);
        });

        let result = await this._queue[key];
        delete this._queue[key];
        return result;
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
        if(Object.keys(this._faviconCache).length > 512) {
            do {
                let key = this._keyHistory.shift();
                if(this._faviconCache.hasOwnProperty(key)) {
                    delete this._faviconCache[key];
                }
            } while(Object.keys(this._faviconCache).length > 512);
        }

        this._faviconCache[id] = data;
        this._keyHistory.push(id);
    }
};