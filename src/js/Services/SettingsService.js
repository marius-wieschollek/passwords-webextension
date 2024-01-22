import Setting from '@js/Models/Setting/Setting';
import SystemService from "@js/Services/SystemService";
import ErrorManager from "@js/Manager/ErrorManager";

class SettingsService {

    constructor() {
        /** @type {(MasterSettingsProvider|ClientSettingsProvider|null)} **/
        this._backend = null;
        this._settings = {};
    }

    /**
     *
     * @param {(MasterSettingsProvider|ClientSettingsProvider)} backend
     */
    init(backend) {
        this._backend = backend;
    }

    /**
     * @param {String} name
     * @param {(PasswordsClient|null)} [api]
     * @returns {Promise<Setting>}
     */
    async get(name, api = null) {
        if(api === null && this._settings.hasOwnProperty(name)) {
            return this._settings[name];
        }

        let data;
        if(api !== null) {
            data = await this._backend.getForServer(name, api);
        } else {
            data = await this._backend.get(name);
        }

        let setting = new Setting(name, data.value, data.scope);
        if(api === null || !this._backend.withServer) {
            this._settings[name] = setting;
        }

        return setting;
    }

    /**
     *
     * @param {String} setting
     * @param {(PasswordsClient|null)} [api]
     * @return {Promise<*>}
     */
    async getValue(setting, api = null) {
        let model = await this.get(setting, api);

        return model.getValue();
    }

    /**
     *
     * @param {(Setting|String)} setting
     * @param {*} [value]
     * @param {(PasswordsClient|null)} [api]
     * @return {Promise<*>}
     */
    async set(setting, value, api = null) {
        let name = setting;
        if(setting instanceof Setting) {
            name = setting.getName();
            value = setting.getValue();
        }

        if(api !== null) {
            await this._backend.setForServer(name, value, api);
        } else {
            await this._backend.set(name, value);
            if(this._settings.hasOwnProperty(name)) {
                this._settings[name].setValue(value);
            }
        }

        if(name === 'server.default' && SystemService.getArea() === SystemService.AREA_BACKGROUND) {
            this._reloadSettings()
                .catch(ErrorManager.catch);
        }
    }

    /**
     *
     * @param {(Setting|String)} setting
     * @param {(PasswordsClient|null)} api
     * @return {Promise<*>}
     */
    async reset(setting, api = null) {
        let isSetting = setting instanceof Setting,
            name      = isSetting ? setting.getName():setting,
            value;

        if(api !== null) {
            value = await this._backend.resetForServer(name, api);
        } else {
            value = await this._backend.reset(name);
            if(this._settings.hasOwnProperty(name)) {
                this._settings[name].setValue(value);
            }
        }
        if(isSetting) setting.setValue(value);

        if(name === 'server.default' && SystemService.getArea() === SystemService.AREA_BACKGROUND) {
            this._reloadSettings()
                .catch(ErrorManager.catch);
        }

        return isSetting ? setting:value;
    }

    /**
     *
     * @returns {Promise<void>}
     */
    reload() {
        return this._reloadSettings();
    }

    /**
     * @return {Promise<void>}
     * @private
     */
    async _reloadSettings() {
        for(let name in this._settings) {
            if(!this._settings.hasOwnProperty(name)) continue;
            let data = await this._backend.get(name);
            this._settings[name].setValue(data.value);
        }
    }
}

export default new SettingsService();