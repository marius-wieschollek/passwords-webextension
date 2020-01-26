import LocalisationService from '@js/Services/LocalisationService';
import Server from '@js/Models/Server/Server';
import ServerRepository from '@js/Repositories/ServerRepository';
import ServerManager from '@js/Manager/ServerManager';
import ErrorManager from '@js/Manager/ErrorManager';
import AbstractController from '@js/Controller/AbstractController';
import Api from 'passwords-client';
import HttpError from 'passwords-client/src/Exception/Http/HttpError';

export default class Create extends AbstractController {

    /**
     *
     * @param {Message} message
     * @param {Message} reply
     */
    async execute(message, reply) {
        let data = message.getPayload();

        let response = {};
        if(!this._checkFormData(data, response)) {
            reply.setType('validation.error')
                .setPayload(response);
            return;
        }

        let server = this._createModel(data, response);
        if(server &&
           await this._duplicateCheck(server, response) &&
           await this._checkConnection(server, response) &&
           await this._createServer(server, response)
        ) {
            ServerManager.addServer(server)
                .catch(ErrorManager.catch());
            reply.setType('server.item').setPayload(server);
        } else {
            reply.setType('validation.error').setPayload(response);
        }
    }

    _checkFormData(data, response) {
        let validationOk = true;
        let errors = {};
        if(!this._validateLabel(data, errors)) validationOk = false;
        if(!this._validateUser(data, errors)) validationOk = false;
        if(!this._validateBaseUrl(data, errors)) validationOk = false;
        if(!this._validateToken(data, errors)) validationOk = false;

        if(!validationOk) {
            response.message = 'Validation failed';
            response.errors = errors;
        }

        return validationOk;
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

        let baseUrlRegex = /^https:\/\/[\w.\/]+$/;
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
        if(tokenRegex.test(errors.token)) {
            errors.token = LocalisationService.translate('ValidationNotAToken');
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
            return new Server(data);
        } catch(e) {
            ErrorManager.logError(e);
            response.message = e.message;
            return false;
        }
    }

    /**
     *
     * @param {Server} server
     * @param {Object} response
     * @returns {Promise<boolean>}
     * @private
     */
    async _checkConnection(server, response) {
        try {
            let api = new Api(server, {}, {model: {server: Server}});
            let sessionAuth = api.getSessionAuthorization();
            await sessionAuth.load();
            return true;
        } catch(e) {
            ErrorManager.logError(e);
            if(e.message === 'Failed to fetch') {
                response.message = LocalisationService.translate('ValidationNoConnection', server.getBaseUrl());
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
     * @param {Object} response
     * @returns {Promise<boolean>}
     * @private
     */
    async _duplicateCheck(server, response) {
        let servers = await ServerRepository.findAll();

        for(let current of servers) {
            if(server.getBaseUrl() === current.getBaseUrl() && server.getUser() === current.getUser()) {
                response.message = LocalisationService.translate('ValidationDuplicate');
                return false;
            }
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
    async _createServer(server, response) {
        try {
            await ServerRepository.create(server);
            return true;
        } catch(e) {
            response.message = e.message;
            return false;
        }
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
        let fieldLabel = 'Validation' + field[0].toUpperCase() + field.substr(1);
        let fieldName = LocalisationService.translate(fieldLabel);
        variables.unshift(fieldName);

        return LocalisationService.translate(message, [fieldName]);
    }
}