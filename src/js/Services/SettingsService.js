import StorageService from '@js/Services/StorageService';
import Setting from '@js/Models/Setting/Setting';

class SettingsService {

    constructor() {
        this.browserScopes = [Setting.SCOPE_LOCAL, Setting.SCOPE_SYNC];
        this.serverScopes = [Setting.SCOPE_USER, Setting.SCOPE_SERVER, Setting.SCOPE_CLIENT];

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
            ]
        };
        this._defaults = {
            'theme.custom'                : null,
            'theme.current'               : 'light',
            'server.default'              : null,
            'password.autosubmit'         : true,
            'notification.password.new'   : true,
            'notification.password.update': true
        };
    }

    /**
     *
     * @param {String} setting
     * @return {Promise<Setting>}
     */
    async get(setting) {
        if(!this._mapping.hasOwnProperty(setting)) {
            // @TODO use custom error
            throw new Error('Unknown setting');
        }

        let mapping = this._mapping[setting];
        for(let key of mapping) {
            let {scope, name} = this._getScopeAndName(key),
                model;

            if(this.browserScopes.indexOf(scope) !== -1) {
                model = await this._browserGet(scope, name);
            } else if(this.serverScopes.indexOf(scope) !== -1) {
                model = await this._serverGet(key);
            }

            if(model) return model;
        }

        return new Setting(setting, this._defaults[setting], Setting.SCOPE_LOCAL);
    }

    /**
     *
     * @param {(Setting|String)} setting
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
        let mapping;
        if(setting instanceof Setting) {
            // @TODO use custom error
            if(!this._mapping.hasOwnProperty(setting.getName())) throw new Error('Unknown setting');

            mapping = this._mapping[setting.getName()];
            value = setting.getValue();
        } else {
            // @TODO use custom error
            if(!this._mapping.hasOwnProperty(setting)) throw new Error('Unknown setting');

            mapping = this._mapping[setting];
        }

        for(let key of mapping) {
            let {scope, name} = this._getScopeAndName(key);

            let model = new Setting(name, value, scope);
            if(this.browserScopes.indexOf(scope) !== -1) {
                await this._browserSet(model);
            } else if(this.serverScopes.indexOf(scope) !== -1) {
                await this._serverSet(model);
            }
        }
    }

    /**
     *
     * @param {(Setting|String)} setting
     * @return {Promise<*>}
     */
    async reset(setting) {
        let mapping;
        if(setting instanceof Setting) {
            // @TODO use custom error
            if(!this._mapping.hasOwnProperty(setting.getName())) throw new Error('Unknown setting');

            mapping = this._mapping[setting.getName()];
            setting.setValue(this._defaults[setting.getName()]);
        } else {
            // @TODO use custom error
            if(!this._mapping.hasOwnProperty(setting)) throw new Error('Unknown setting');

            mapping = this._mapping[setting];
        }

        for(let key of mapping) {
            let {scope, name} = this._getScopeAndName(key);

            let model = new Setting(name, value, scope);
            if(this.browserScopes.indexOf(scope) !== -1) {
                await this._browserDelete(model);
            } else if(this.serverScopes.indexOf(scope) !== -1) {
                await this._serverDelete(model);
            }
        }
    }

    async list() {
    }

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
     * @return {Promise<Setting>}
     * @private
     */
    async _browserGet(scope, name) {
        let key = `setting.${name}`;

        if(await StorageService.has(key, scope)) {
            let value = await StorageService.get(key, scope);
            return new Setting(name, value, scope);
        }
    }

    /**
     *
     * @param {String} setting
     * @return {Promise<Setting>}
     * @private
     */
    async _serverGet(setting) {
        return undefined;
    }

    /**
     *
     * @param {Setting} setting
     * @return {Promise<Boolean>}
     * @private
     */
    async _browserSet(setting) {
        let name = `setting.${setting.getName()}`;

        return await StorageService.set(name, setting.getValue(), setting.getScope());
    }

    /**
     *
     * @param {Setting} setting
     * @return {Promise<Boolean>}
     * @private
     */
    async _serverSet(setting) {
        return undefined;
    }

    /**
     *
     * @param {Setting} setting
     * @return {Promise<Boolean>}
     * @private
     */
    async _browserDelete(setting) {
        let name = `setting.${setting.getName()}`;

        return await StorageService.remove(name, setting.getScope());
    }

    /**
     *
     * @param {Setting} setting
     * @return {Promise<Boolean>}
     * @private
     */
    async _serverDelete(setting) {
        return undefined;
    }
}

export default new SettingsService();