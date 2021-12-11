import ServerRepository from '@js/Repositories/ServerRepository';
import ToastService from '@js/Services/ToastService';
import SystemService from '@js/Services/SystemService';
import ErrorManager from '@js/Manager/ErrorManager';
import Toast from '@js/Models/Toast/Toast';
import ConnectionErrorHelper from '@js/Helper/ConnectionErrorHelper';

export default class ServerRequirementCheck {

    get MINIMUM_APP_VERSION() {
        return [2021, 12];
    }

    /**
     *
     * @param {PasswordsClient} api
     */
    constructor(api) {
        this._connectionError = new ConnectionErrorHelper();
        this._api = api;
    }

    /**
     *
     * @param disable
     * @return {Promise<boolean>}
     */
    async check(disable = false) {
        try {
            let repository = this._api.getInstance('repository.setting'),
                collection = await repository.findByName('server.app.version'),
                setting    = collection.get(0);

            if(setting.getValue() === null || !this._versionCompare(setting.getValue())) {
                if(disable) await this._disableServer(setting.getValue());
                return false;
            }

        } catch(e) {
            this._processError(e);
            return false;
        }

        return true;
    };

    /**
     *
     * @return {Promise<void>}
     * @private
     */
    async _disableServer(serverVersion) {
        let server = this._api.getServer();
        server.setEnabled(false);
        server.setStatus(server.STATUS_DISABLED);
        await ServerRepository.update(server);
        let minVersion = this.MINIMUM_APP_VERSION.join('.');

        let toast = new Toast()
            .setTitle('ToastServerCheckTitle')
            .setMessage('ToastServerCheckMessage')
            .setTitleVars([server.getLabel()])
            .setMessageVars([server.getLabel(), minVersion, serverVersion])
            .setType('error')
            .setTags([this._api.getServer().getId(), 'server-error'])
            .setTtl(0);

        ErrorManager.error('Disabled account with unsupported api version', {server: server.getLabel(), version: serverVersion, requiredVersion: minVersion});

        ToastService.create(toast)
            .then(() => {SystemService.getBrowserApi().tabs.create({active: true, url: server.getBaseUrl()});})
            .catch(ErrorManager.catch);
    }

    /**
     * @param version
     * @return {Boolean}
     */
    _versionCompare(version) {
        let base  = this.MINIMUM_APP_VERSION,
            parts = version.split('.');

        for(let i = 0; i < base.length; i++) {
            if(!parts.hasOwnProperty(i)) return false;

            let part = parseInt(parts[i]);
            if(part < base[i]) return false;
            if(part > base[i]) return true;
        }

        return true;
    }

    /**
     *
     * @param {Error} error
     * @return {Promise<void>}
     * @private
     */
    _processError(error) {
        return this._connectionError.processError(error, this._api.getServer());
    }
}