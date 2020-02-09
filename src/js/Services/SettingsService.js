import StorageService from '@js/Services/StorageService';
import Setting from '@js/Models/Setting/Setting';

class SettingsService {

    constructor() {
        this.browserScopes = [Setting.SCOPE_LOCAL, Setting.SCOPE_SYNC];
        this.serverScopes = [Setting.SCOPE_USER, Setting.SCOPE_SERVER, Setting.SCOPE_CLIENT];
    }

    /**
     *
     * @param {String} setting
     * @param {*} [fallback=null]
     * @return {Promise<Setting>}
     */
    async get(setting, fallback = null) {
        let [scope, name] = setting.split('.', 2);

        if(this.browserScopes.indexOf(scope) !== -1) {
            return await this._browserGet(scope, name, fallback);
        } else if(this.serverScopes.indexOf(scope) !== -1) {
            return await this._serverGet(setting, fallback);
        }

        // @TODO use custom error
        throw new Error('Unknown scope');
    }

    /**
     *
     * @param {(Setting|String)} setting
     * @param {*} [fallback=null]
     * @return {Promise<*>}
     */
    async getValue(setting, fallback = null) {
        let model = await this.get(setting, fallback);

        return model.getValue();
    }

    /**
     *
     * @param {(Setting|String)} setting
     * @param {*} [value]
     * @return {Promise<*>}
     */
    async set(setting, value) {
        let {scope, name} = this._getScopeAndName(setting);


        if(setting instanceof Setting) {
            value = setting.getValue();
        }

        if(this.browserScopes.indexOf(scope) !== -1) {
            return await this._browserSet(scope, name, value);
        } else if(this.serverScopes.indexOf(scope) !== -1) {
            return await this._serverSet(setting, value);
        }

        // @TODO use custom error
        throw new Error('Unknown scope');
    }

    /**
     *
     * @param {(Setting|String)} setting
     * @return {Promise<*>}
     */
    async reset(setting) {
        let {scope, name} = this._getScopeAndName(setting);

        if(this.browserScopes.indexOf(scope) !== -1) {
            return await this._browserDelete(scope, name);
        } else if(this.serverScopes.indexOf(scope) !== -1) {
            return await this._serverDelete(setting);
        }

        // @TODO use custom error
        throw new Error('Unknown scope');
    }

    async list() {
    }

    _getScopeAndName(setting) {
        let scope, name;
        if(setting instanceof Setting) {
            scope = setting.getScope();
            name = setting.getName();
        } else {
            [scope, name] = setting.split('.', 2);
        }
        return {scope, name};
    }

    /**
     *
     * @param {String} scope
     * @param {String} name
     * @param {*} fallback
     * @return {Promise<*>}
     * @private
     */
    async _browserGet(scope, name, fallback) {
        let key   = `setting.${name}`,
            value = fallback;

        if(await StorageService.has(key, scope)) {
            value = await StorageService.get(key, scope);
        }

        return new Setting(name, value, scope);
    }

    async _serverGet(setting) {
        return undefined;
    }

    /**
     *
     * @param {String} scope
     * @param {String} name
     * @param {*} value
     * @return {Promise<Boolean>}
     * @private
     */
    async _browserSet(scope, name, value) {
        name = `setting.${name}`;

        return await StorageService.set(name, value, scope);
    }

    async _serverSet(setting, value) {
        return undefined;
    }

    /**
     *
     * @param {String} scope
     * @param {String} name
     * @return {Promise<Boolean>}
     * @private
     */
    async _browserDelete(scope, name) {
        name = `setting.${name}`;

        return await StorageService.remove(name, scope);
    }

    async _serverDelete(setting) {
        return undefined;
    }
}

export default new SettingsService();