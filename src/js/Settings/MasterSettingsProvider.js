import Setting from '@js/Models/Setting/Setting';
import StorageService from '@js/Services/StorageService';
import ServerManager from "@js/Manager/ServerManager";
import ErrorManager from "@js/Manager/ErrorManager";

class MasterSettingsProvider {

    get withServer() {
        return true;
    }

    constructor() {
        this.browserScopes = [Setting.SCOPE_LOCAL, Setting.SCOPE_SYNC];
        this.serverScopes = [Setting.SCOPE_USER, Setting.SCOPE_SERVER, Setting.SCOPE_CLIENT];

        this._mapping = {
            'server.default'                 : [
                'sync.server.default',
                'local.server.default'
            ],
            'paste.form.submit'              : [
                'sync.password.autosubmit',
                'local.password.autosubmit',
                'client.ext.password.autosubmit'
            ],
            'paste.popup.close'              : [
                'sync.password.autoclose',
                'local.password.autoclose',
                'client.ext.password.autoclose'
            ],
            'paste.autofill'                 : [
                'sync.paste.autofill',
                'local.paste.autofill',
                'client.ext.paste.autofill'
            ],
            'paste.basic-auth'               : [
                'sync.paste.basic-auth',
                'local.paste.basic-auth',
                'client.ext.paste.basic-auth'
            ],
            'paste.compromised.warning'      : [
                'sync.paste.compromised.warning',
                'local.paste.compromised.warning',
                'client.ext.paste.compromised.warning'
            ],
            'password.folder.private'        : [
                'client.ext.folder.private'
            ],
            'password.generator.strength'    : [
                'user.password.generator.strength'
            ],
            'password.generator.numbers'     : [
                'user.password.generator.numbers'
            ],
            'password.generator.special'     : [
                'user.password.generator.special'
            ],
            'popup.related.search'           : [
                'sync.popup.related.search',
                'local.popup.related.search',
                'client.ext.popup.related.search'
            ],
            'notification.password.new'      : [
                'sync.notification.password.new',
                'local.notification.password.new',
                'client.ext.notification.password.new'
            ],
            'notification.password.update'   : [
                'sync.notification.password.update',
                'local.notification.password.update',
                'client.ext.notification.password.update'
            ],
            'notification.password.quicksave': [
                'sync.notification.password.quicksave',
                'local.notification.password.quicksave',
                'client.ext.notification.password.quicksave'
            ],
            'theme.current'                  : [
                'sync.theme.current',
                'local.theme.current'
            ],
            'theme.custom'                   : [
                'sync.theme.custom',
                'local.theme.custom'
            ],
            'debug.localisation.enabled'     : [
                'local.localisation.enabled'
            ],
            'search.recommendation.maxRows'  : [
                'sync.search.recommendation.maxRows',
                'local.search.recommendation.maxRows'
            ],
            'search.recommendation.mode'     : [
                'sync.search.recommendation.mode',
                'local.search.recommendation.mode'
            ],
            'clipboard.clear.passwords'      : [
                'sync.clipboard.clear.passwords',
                'local.clipboard.clear.passwords'
            ],
            'clipboard.clear.delay'          : [
                'sync.clipboard.clear.delay',
                'local.clipboard.clear.delay'
            ],
            'password.list.show.user'        : [
                'sync.password.list.show.user',
                'local.password.list.show.user'
            ],
            'mining.ignored-domains'         : [
                'sync.mining.ignored-domains',
                'local.mining.ignored-domains'
            ],
            'mining.incognito.hide'          : [
                'sync.mining.incognito.hide',
                'local.mining.incognito.hide',
                'client.ext.mining.incognito.hide'
            ],
            'setup.initialized'          : [
                'sync.setup.initialized'
            ]
        };
        this._defaults = {
            'theme.custom'                   : null,
            'theme.current'                  : 'light',
            'server.default'                 : null,
            'paste.popup.close'              : true,
            'paste.form.submit'              : true,
            'paste.compromised.warning'      : true,
            'paste.autofill'                 : false,
            'paste.basic-auth'               : false,
            'popup.related.search'           : true,
            'password.folder.private'        : null,
            'notification.password.new'      : true,
            'notification.password.update'   : true,
            'notification.password.quicksave': false,
            'debug.localisation.enabled'     : true,
            'search.recommendation.mode'     : 'host',
            'search.recommendation.maxRows'  : 8,
            'clipboard.clear.passwords'      : false,
            'clipboard.clear.delay'          : 60,
            'password.list.show.user'        : false,
            'mining.ignored-domains'         : '',
            'mining.incognito.hide'          : true,
            'setup.initialized'              : false
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
                value = this._browserGet(scope, name);
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
     * @param {String} setting
     * @param {PasswordsClient} api
     * @return {Promise<{value:*, scope:String}>}
     */
    async getForServer(setting, api) {
        // @TODO use custom error
        if(!this._mapping.hasOwnProperty(setting)) throw new Error('Unknown setting');

        let mapping = this._mapping[setting];
        for(let key of mapping) {
            let {scope, name} = this._getScopeAndName(key),
                value;

            if(this.serverScopes.indexOf(scope) !== -1) {
                value = await this._serverGet(key, api);
            }

            if(value !== undefined) return {value, scope};
        }

        return {value: this._defaults[setting], scope: Setting.SCOPE_LOCAL};
    }

    /**
     *
     * @param {String} setting
     * @param {*} [value]
     * @param {PasswordsClient} api
     * @return {Promise<*>}
     */
    async setForServer(setting, value, api) {
        // @TODO use custom error
        if(!this._mapping.hasOwnProperty(setting)) throw new Error('Unknown setting');

        let mapping = this._mapping[setting];
        for(let key of mapping) {
            let {scope, name} = this._getScopeAndName(key);

            if(this.serverScopes.indexOf(scope) !== -1) {
                await this._serverSet(key, value, api);
            }
        }
    }

    /**
     *
     * @param {String} setting
     * @param {(PasswordsClient|null)} api
     *
     * @return {Promise<*>}
     */
    async resetForServer(setting, api) {
        // @TODO use custom error
        if(!this._mapping.hasOwnProperty(setting)) throw new Error('Unknown setting');
        let mapping = this._mapping[setting];

        for(let key of mapping) {
            let {scope, name} = this._getScopeAndName(key);

            if(this.serverScopes.indexOf(scope) !== -1) {
                await this._serverDelete(key, api);
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
    _browserGet(scope, name) {
        let key = `setting.${name}`;

        if(StorageService.has(key, scope)) {
            return StorageService.get(key, scope);
        }

        return undefined;
    }

    /**
     *
     * @param {String} key
     * @param {(PasswordsClient|null)} api
     *
     * @return {Promise<*>}
     * @private
     */
    async _serverGet(key, api = null) {
        let setting = await this._getServerSetting(key, api);

        if(setting === null) return undefined;
        if(setting.getValue() === null) return undefined;

        return setting.getValue();
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
     * @param {(PasswordsClient|null)} api
     *
     * @return {Promise<Boolean>}
     * @private
     */
    async _serverSet(key, value, api = null) {
        let setting    = await this._getServerSetting(key, api),
            repository = await this._getSettingsRepository(api);
        if(!repository) return false;

        if(api === null) {
            api = await ServerManager.getDefaultApi();
        }
        if(!api.isAuthorized()) return false;

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
     * @param {(PasswordsClient|null)} api
     *
     * @return {Promise<Boolean>}
     * @private
     */
    async _serverDelete(key, api = null) {
        let setting = await this._getServerSetting(key, api);

        if(setting !== null) {
            let repository = await this._getSettingsRepository(api);
            if(!repository) return false;

            await repository.reset(setting);
        }

        return true;
    }

    /**
     *
     * @param {String} key
     * @param {(PasswordsClient|null)} api
     *
     * @returns {Promise<null|Setting>}
     * @private
     */
    async _getServerSetting(key, api = null) {
        let repository = await this._getSettingsRepository(api);
        if(!repository) return null;

        let settings = /** @type {SettingCollection} **/ await repository.findByName(key);
        if(settings.length === 0) return null;

        return settings.get(0);
    }

    /**
     *
     * @param {(PasswordsClient|null)} api
     *
     * @returns {Promise<(SettingRepository|null)>}
     * @private
     */
    async _getSettingsRepository(api = null) {
        try {
            if(api === null) {
                api = await ServerManager.getDefaultApi();
            }
            if(api.getServer().getStatus() === api.getServer().STATUS_AUTHORIZED) {
                return /** @type {SettingRepository} **/ api.getInstance('repository.setting');
            }
        } catch(e) {
            ErrorManager.logError(e);
        }
        return null;
    }
}

export default new MasterSettingsProvider();