import Setting from '@js/Models/Setting/Setting';
import StorageService from '@js/Services/StorageService';
import ServerManager from "@js/Manager/ServerManager";
import ErrorManager from "@js/Manager/ErrorManager";

class MasterSettingsProvider {

    constructor() {
        this.browserScopes = [Setting.SCOPE_LOCAL, Setting.SCOPE_SYNC];
        this.serverScopes = [Setting.SCOPE_USER, Setting.SCOPE_SERVER, Setting.SCOPE_CLIENT];
        this._serverSettings = {};

        this._mapping = {
            'server.default'              : [
                'local.server.default',
                'sync.server.default'
            ],
            'password.autosubmit'         : [
                'client.ext.password.autosubmit',
                'local.password.autosubmit',
                'sync.password.autosubmit'
            ],
            'password.folder.private'     : [
                'client.ext.folder.private'
            ],
            'password.generator.strength' : [
                'user.password.generator.strength'
            ],
            'password.generator.numbers'  : [
                'user.password.generator.numbers'
            ],
            'password.generator.special'  : [
                'user.password.generator.special'
            ],
            'popup.autoclose'             : [
                'client.ext.password.autoclose',
                'local.password.autoclose',
                'sync.password.autoclose'
            ],
            'popup.related.search'        : [
                'client.ext.popup.related.search',
                'local.popup.related.search',
                'sync.popup.related.search'
            ],
            'notification.password.new'   : [
                'client.ext.notification.password.new',
                'local.notification.password.new',
                'sync.notification.password.new'
            ],
            'notification.password.update': [
                'client.ext.notification.password.update',
                'local.notification.password.update',
                'sync.notification.password.update'
            ],
            'theme.current'               : [
                'client.ext.theme.current',
                'local.theme.current',
                'sync.theme.current'
            ],
            'theme.custom'                : [
                'sync.theme.custom',
                'local.theme.custom'
            ],
            'debug.localisation.enabled'  : [
                'local.localisation.enabled'
            ]
        };
        this._defaults = {
            'theme.custom'                : null,
            'theme.current'               : 'light',
            'server.default'              : null,
            'popup.autoclose'             : true,
            'popup.related.search'        : true,
            'password.autosubmit'         : true,
            'password.folder.private'     : null,
            'notification.password.new'   : true,
            'notification.password.update': true,
            'debug.localisation.enabled'  : true
        };
    }

    /**
     *
     * @param {String} setting
     * @return {Promise<{value:*, scope:String}>}
     */
    async get(setting) {
        // @TODO use custom error
        if(!this._mapping.hasOwnProperty(setting)) throw new Error('Unknown setting');

        let mapping = this._mapping[setting];
        for(let key of mapping) {
            let {scope, name} = this._getScopeAndName(key),
                value;

            if(this.browserScopes.indexOf(scope) !== -1) {
                value = await this._browserGet(scope, name);
            } else if(this.serverScopes.indexOf(scope) !== -1) {
                value = await this._serverGet(key);
            }

            if(value !== undefined) return {value, scope};
        }

        return {value: this._defaults[setting], scope: Setting.SCOPE_LOCAL};
    }

    /**
     *
     * @param {String} setting
     * @param {*} [value]
     * @return {Promise<*>}
     */
    async set(setting, value) {
        // @TODO use custom error
        if(!this._mapping.hasOwnProperty(setting)) throw new Error('Unknown setting');

        let mapping = this._mapping[setting];
        for(let key of mapping) {
            let {scope, name} = this._getScopeAndName(key);

            if(this.browserScopes.indexOf(scope) !== -1) {
                await this._browserSet(scope, name, value);
            } else if(this.serverScopes.indexOf(scope) !== -1) {
                await this._serverSet(key, value);
            }
        }
    }

    /**
     *
     * @param {String} setting
     * @return {Promise<*>}
     */
    async reset(setting) {
        // @TODO use custom error
        if(!this._mapping.hasOwnProperty(setting)) throw new Error('Unknown setting');
        let mapping = this._mapping[setting];

        for(let key of mapping) {
            let {scope, name} = this._getScopeAndName(key);

            if(this.browserScopes.indexOf(scope) !== -1) {
                await this._browserDelete(scope, name);
            } else if(this.serverScopes.indexOf(scope) !== -1) {
                await this._serverDelete(key);
            }
        }

        return this._defaults[setting];
    }

    /**
     *
     * @param setting
     * @return {{scope: string, name: string}}
     * @private
     */
    _getScopeAndName(setting) {
        let scope, name;
        if(setting instanceof Setting) {
            scope = setting.getScope();
            name = setting.getName();
        } else {
            let index = setting.indexOf('.');
            scope = setting.substr(0, index);
            name = setting.substring(index + 1);
        }

        return {scope, name};
    }

    /**
     *
     * @param {String} scope
     * @param {String} name
     * @return {Promise<*>}
     * @private
     */
    async _browserGet(scope, name) {
        let key = `setting.${name}`;

        if(await StorageService.has(key, scope)) {
            return await StorageService.get(key, scope);
        }

        return undefined;
    }

    /**
     *
     * @param {String} key
     * @return {Promise<*>}
     * @private
     */
    async _serverGet(key) {
        let setting = await this._getServerSetting(key);

        return setting === null ? undefined:setting.getValue();
    }

    /**
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

    /**
     *
     * @param {String} key
     * @param {*} value
     * @return {Promise<Boolean>}
     * @private
     */
    async _serverSet(key, value) {
        let setting    = await this._getServerSetting(key),
            repository = await this._getSettingsRepository();
        if(!repository) return false;

        if(setting !== null) {
            setting.setValue(value);
        } else {
            setting = new Setting(key, value, Setting.SCOPE_CLIENT);
        }
        await repository.set(setting);

        return true;
    }

    /**
     * @param {String} scope
     * @param {String} name
     * @return {Promise<Boolean>}
     * @private
     */
    async _browserDelete(scope, name) {
        name = `setting.${name}`;

        return await StorageService.remove(name, scope);
    }

    /**
     *
     * @param {String} key
     * @return {Promise<Boolean>}
     * @private
     */
    async _serverDelete(key) {
        let setting = await this._getServerSetting(key);

        if(setting !== null) {
            let repository = await this._getSettingsRepository();
            if(!repository) return false;

            await repository.reset(setting);
        }

        return true;
    }

    /**
     *
     * @param key
     * @returns {Promise<null|Setting>}
     * @private
     */
    async _getServerSetting(key) {
        if(this._serverSettings.hasOwnProperty(key)) {
            return this._serverSettings[key];
        }

        let repository = await this._getSettingsRepository();
        if(!repository) return null;

        let settings = /** @type {SettingCollection} **/ await repository.findByName(key);
        if(settings.length === 0) return null;
        this._serverSettings[key] = settings.get(0);

        return settings.get(0);
    }

    /**
     *
     * @returns {Promise<(SettingRepository|null)>}
     * @private
     */
    async _getSettingsRepository() {
        try {
            let api = await ServerManager.getDefaultApi();

            return /** @type {SettingRepository} **/ api.getInstance('repository.setting');
        } catch(e) {
            ErrorManager.logError(e);
            return null;
        }
    }
}

export default new MasterSettingsProvider();