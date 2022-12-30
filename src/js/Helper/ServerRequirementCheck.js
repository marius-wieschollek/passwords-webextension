import ServerRepository from '@js/Repositories/ServerRepository';
import ToastService from '@js/Services/ToastService';
import SystemService from '@js/Services/SystemService';
import ErrorManager from '@js/Manager/ErrorManager';
import Toast from '@js/Models/Toast/Toast';
import ConnectionErrorHelper from '@js/Helper/ConnectionErrorHelper';

export default class ServerRequirementCheck {

    get MINIMUM_APP_VERSION() {
        return [2021, 1];
    }

    get WARNING_APP_VERSION() {
        return [2022, 12];
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
            } else if(disable && !this._versionCompare(setting.getValue(), this.WARNING_APP_VERSION)) {
                await this._markServerAsSoonIncompatible(setting.getValue());
            } else {
                this._removeFlags(disable);
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
        server.addFlag(server.FLAG_INCOMPATIBLE);
        await ServerRepository.update(server);
        let minVersion = this.MINIMUM_APP_VERSION.join('.');

        ErrorManager.error('Disabled account with unsupported api version', {server: server.getLabel(), version: serverVersion, requiredVersion: minVersion});
        this._sendServerDisabledToast(server, minVersion, serverVersion);
    }

    /**
     *
     * @return {Promise<void>}
     * @private
     */
    async _markServerAsSoonIncompatible(serverVersion) {
        let server = this._api.getServer();
        server.addFlag(server.FLAG_SOON_INCOMPATIBLE);
        await ServerRepository.update(server);

        this._sendServerWarningToast(server, this.WARNING_APP_VERSION.join('.'), serverVersion);
    }

    /**
     *
     * @return {Promise<void>}
     * @private
     */
    async _removeFlags(save) {
        let server = this._api.getServer();
        if(server.hasFlag(server.FLAG_SOON_INCOMPATIBLE)) {
            server.removeFlag(server.FLAG_SOON_INCOMPATIBLE);
            if(save) await ServerRepository.update(server);
        }
        if(server.hasFlag(server.FLAG_INCOMPATIBLE)) {
            server.removeFlag(server.FLAG_INCOMPATIBLE);
            server.setEnabled(true);
            server.setStatus(server.STATUS_UNAUTHORIZED);
            if(save) await ServerRepository.update(server);
        }
    }

    /**
     *
     * @param {Server} server
     * @param {String} minVersion
     * @param {String} serverVersion
     * @private
     */
    _sendServerDisabledToast(server, minVersion, serverVersion) {
        let toast = new Toast()
            .setTitle('ToastServerCheckTitle')
            .setMessage('ToastServerCheckMessage')
            .setTitleVars([server.getLabel()])
            .setMessageVars([server.getLabel(), minVersion, serverVersion])
            .setType('error')
            .setTags([this._api.getServer().getId(), 'server-error'])
            .setTtl(0);

        ToastService.create(toast)
                    .then(() => {SystemService.getBrowserApi().tabs.create({active: true, url: server.getBaseUrl()});})
                    .catch(ErrorManager.catch);
    }

    /**
     *
     * @param {Server} server
     * @param {String} minVersion
     * @param {String} serverVersion
     * @private
     */
    _sendServerWarningToast(server, minVersion, serverVersion) {
        let toast = new Toast()
            .setTitle('ToastServerCheckTitle')
            .setMessage('ToastServerCheckWarning')
            .setTitleVars([server.getLabel()])
            .setMessageVars([server.getLabel(), minVersion, serverVersion])
            .setType('warning')
            .setTags([this._api.getServer().getId(), 'server-error'])
            .setTtl(0);

        ToastService.create(toast)
                    .then(() => {SystemService.getBrowserApi().tabs.create({active: true, url: server.getBaseUrl()});})
                    .catch(ErrorManager.catch);
    }

    /**
     * @param {String} version
     * @param {Array} base
     * @return {Boolean}
     */
    _versionCompare(version, base = this.MINIMUM_APP_VERSION) {
        let parts = version.split('.');

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