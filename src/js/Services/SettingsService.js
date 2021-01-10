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
     * @returns {Promise<Setting>}
     */
    async get(name) {
        if(this._settings.hasOwnProperty(name)) {
            return this._settings[name];
        }

        let data    = await this._backend.get(name),
            setting = new Setting(name, data.value, data.scope);

        this._settings[name] = setting;

        return setting;
    }

    /**
     *
     * @param {String} setting
     * @return {Promise<*>}
     */
    async getValue(setting) {
        let model = await this.get(setting);

        return model.getValue();
    }

    /**
     *
     * @param {(Setting|String)} setting
     * @param {*} [value]
     * @return {Promise<*>}
     */
    async set(setting, value) {
        let name = setting;
        if(setting instanceof Setting) {
            name = setting.getName();
            value = setting.getValue();
        }

        await this._backend.set(name, value);
        if(this._settings.hasOwnProperty(name)) {
            this._settings[name].setValue(value);
        }

        if(name === 'server.default' && SystemService.getArea() === SystemService.AREA_BACKGROUND) {
            this._reloadSettings()
                .catch(ErrorManager.catchEvt);
        }
    }

    /**
     *
     * @param {(Setting|String)} setting
     * @return {Promise<*>}
     */
    async reset(setting) {
        let isSetting = setting instanceof Setting,
            name      = isSetting ? setting.getName():setting;

        let value = await this._backend.reset(name);
        if(isSetting) setting.setValue(value);
        if(this._settings.hasOwnProperty(name)) {
            this._settings[name].setValue(value);
        }

        if(name === 'server.default' && SystemService.getArea() === SystemService.AREA_BACKGROUND) {
            this._reloadSettings()
                .catch(ErrorManager.catchEvt);
        }

        return isSetting ? setting:value;
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