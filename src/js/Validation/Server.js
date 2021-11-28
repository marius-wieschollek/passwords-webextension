import LocalisationService from '@js/Services/LocalisationService';
import ErrorManager from '@js/Manager/ErrorManager';
import {PasswordsClient} from 'passwords-client';
import {HttpError, UnauthorizedError} from 'passwords-client/errors';
import ServerRepository from '@js/Repositories/ServerRepository';
import ServerModel from '@js/Models/Server/Server';
import ServerRequirementCheck from '@js/Helper/ServerRequirementCheck';

export default class Server {

    /**
     *
     * @param data
     * @return {Promise<{ok: Boolean, errors: {}, [server]: ServerModel}>}
     */
    async validate(data) {
        let result = this._checkFormData(data);
        if(!result.ok) return result;

        let server = this._createModel(data, result);
        if(server &&
           await this._duplicateCheck(server, result) &&
           await this._checkConnection(server, result) &&
           await this._checkRequirements(server, result)) {
            result.server = server;
        }

        return result;
    }

    /**
     *
     * @param data
     * @return {Object} {{ok: boolean, errors: {}}}
     * @private
     */
    _checkFormData(data) {
        let result = {ok: true, errors: {}};
        if(!this._validateLabel(data, result.errors)) result.ok = false;
        if(!this._validateUser(data, result.errors)) result.ok = false;
        if(!this._validateBaseUrl(data, result.errors)) result.ok = false;
        if(!this._validateToken(data, result.errors)) result.ok = false;
        if(!this._validateTimeout(data, result.errors)) result.ok = false;

        if(!result.ok) {
            result.message = LocalisationService.translate('ValidationFailed');
        }

        return result;
    }

    /**
     *
     * @param {Object} data
     * @param {Object} errors
     * @returns {Boolean}
     * @private
     */
    _validateLabel(data, errors) {
        return this._validateEmpty('label', data, errors) &&
               this._validateLength('label', 1, 48, data, errors);
    }

    /**
     *
     * @param {Object} data
     * @param {Object} errors
     * @returns {Boolean}
     * @private
     */
    _validateUser(data, errors) {
        return this._validateEmpty('user', data, errors) &&
               this._validateLength('user', 1, 48, data, errors);
    }

    /**
     *
     * @param {Object} data
     * @param {Object} errors
     * @returns {Boolean}
     * @private
     */
    _validateBaseUrl(data, errors) {
        if(!this._validateEmpty('baseUrl', data, errors) ||
           !this._validateLength('baseUrl', 12, 1024, data, errors)) {
            return false;
        }

        let index = data.baseUrl.indexOf('index.php');
        if(index !== -1) {
            data.baseUrl = data.baseUrl.substr(0, index);
        } else {
            let index = data.baseUrl.indexOf('apps/passwords');
            if(index !== -1) data.baseUrl = data.baseUrl.substr(0, index);
        }

        if(data.baseUrl.substr(-1) !== '/') {
            data.baseUrl += '/';
        }

        let baseUrlRegex = /^https:\/\/[\w.\/\-]+$/;
        if(baseUrlRegex.test(errors.baseUrl)) {
            errors.baseUrl = LocalisationService.translate('ValidationNotAnUrl');
            return false;
        }

        return true;
    }

    /**
     *
     * @param {Object} data
     * @param {Object} errors
     * @returns {Boolean}
     * @private
     */
    _validateToken(data, errors) {
        if(!this._validateEmpty('token', data, errors) ||
           !this._validateLength('token', 29, 29, data, errors)) {
            return false;
        }

        let tokenRegex = /^([A-Za-z0-9]{5}-?){5}$/;
        if(!tokenRegex.test(data.token)) {
            errors.token = LocalisationService.translate('ValidationNotAToken');
            return false;
        }

        return true;
    }

    /**
     *
     * @param {Object} data
     * @param {Object} errors
     * @returns {Boolean}
     * @private
     */
    _validateTimeout(data, errors) {
        if(!data.hasOwnProperty('timeout')) data.timeout = 0;
        if(typeof data.timeout === 'string') data.timeout = parseInt(data.timeout);

        if([0, 5*60*1000, 10*60*1000, 15*60*1000, 30*60*1000, 60*60*1000].indexOf(data.timeout) === -1) {
            errors.timeout = LocalisationService.translate('ValidationInvalidTimeout');
            return false;
        }

        return true;
    }

    /**
     *
     * @param {String} field
     * @param {Object} data
     * @param {Object} errors
     * @returns {Boolean}
     * @private
     */
    _validateEmpty(field, data, errors) {
        if(!data.hasOwnProperty(field) || !data[field] || typeof data[field] !== 'string') {
            errors[field] = this._createErrorMessage(field, 'ValidationNotEmpty');
            return false;
        }

        let value = data[field].toString().trim();
        if(value.length === 0) {
            errors[field] = this._createErrorMessage(field, 'ValidationNotEmpty');
            return false;
        }

        data[field] = value;
        return true;
    }


    /**
     *
     * @param {String} field
     * @param {Number} min
     * @param {Number} max
     * @param {Object} data
     * @param {Object} errors
     * @returns {Boolean}
     * @private
     */
    _validateLength(field, min, max, data, errors) {
        if(data[field].length < min) {
            errors[field] = this._createErrorMessage(field, 'ValidationMinLength', [max]);
            return false;
        }

        if(data[field].length > max) {
            errors[field] = this._createErrorMessage(field, 'ValidationMaxLength', [max]);
            return false;
        }

        return true;
    }

    /**
     *
     * @param {Object} data
     * @param {Object} response
     * @returns {(Server|Boolean)}
     * @private
     */
    _createModel(data, response) {
        try {
            return new ServerModel(data);
        } catch(e) {
            ErrorManager.logError(e);
            response.ok = false;
            response.message = e.message;
            return false;
        }
    }

    /**
     *
     * @param {Server} server
     * @param {Object} response
     * @returns {Promise<Boolean>}
     * @private
     */
    async _checkConnection(server, response) {
        try {
            let api = new PasswordsClient(server, {});
            let sessionAuth = api.getSessionAuthorization();
            await sessionAuth.load();
            return true;
        } catch(e) {
            ErrorManager.logError(e);
            response.ok = false;
            if(e.message === 'Failed to fetch' || e.message.substr(0, 12) === 'NetworkError') {
                response.message = LocalisationService.translate('ValidationNoConnection', server.getBaseUrl());
            } else if(e instanceof UnauthorizedError) {
                response.message = LocalisationService.translate('ValidationUnauthorizedError', server.getBaseUrl());
            } else if(e instanceof HttpError) {
                response.message = LocalisationService.translate('ValidationHttpError', server.getBaseUrl(), e.message);
            } else {
                response.message = LocalisationService.translate('ValidationConnectionError', server.getBaseUrl(), e.message);
            }
            return false;
        }
    }

    /**
     *
     * @param {Server} server
     * @param {Object} result
     * @returns {Promise<Boolean>}
     * @private
     */
    async _checkRequirements(server, result) {
        let api = new PasswordsClient(server, {}),
            checkHelper = new ServerRequirementCheck(api);

        if(!await checkHelper.check()) {
            result.ok = false;
            result.message = LocalisationService.translate('ValidationServerVersion');
            return false;
        }

        return true;
    }


    /**
     *
     * @param {Server} server
     * @param {Object} response
     * @returns {Promise<boolean>}
     * @private
     */
    async _duplicateCheck(server, response) {
        let servers = await ServerRepository.findAll();

        for(let current of servers) {
            if(server.getId() !== current.getId() && server.getBaseUrl() === current.getBaseUrl() && server.getUser() === current.getUser()) {
                response.message = LocalisationService.translate('ValidationDuplicate');
                response.ok = false;
                return false;
            }
        }

        return true;
    }

    /**
     *
     * @param field
     * @param message
     * @param variables
     * @returns {String}
     * @private
     */
    _createErrorMessage(field, message, variables = []) {
        let fieldLabel = 'Validation' + field[0].toUpperCase() + field.substr(1),
            fieldName = LocalisationService.translate(fieldLabel);
        variables.unshift(fieldName);

        return LocalisationService.translate(message, variables);
    }
}
