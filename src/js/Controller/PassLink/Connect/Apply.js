import AbstractController from '@js/Controller/AbstractController';
import SystemService from '@js/Services/SystemService';
import {HttpError, NetworkError} from 'passwords-client/errors';
import ServerValidation from '@js/Validation/Server';
import ServerRepository from '@js/Repositories/ServerRepository';
import ServerManager from '@js/Manager/ServerManager';
import ErrorManager from '@js/Manager/ErrorManager';
import RegistryService from '@js/Services/RegistryService';

export default class Analyze extends AbstractController {

    /**
     *
     * @param {Message} message
     * @param {Message} reply
     */
    async execute(message, reply) {
        if(!RegistryService.has('passlink.action.connect')) {
            reply.setPayload({success: false, message: 'PasslinkNoActiveAction'});
        }

        /** @type Connect **/
        let action = RegistryService.get('passlink.action.connect');
        action.setClientLabel(await this._getClientLabel());

        let createServer = !RegistryService.has('passlink.connect.' + action.getParameter('id'));
        RegistryService.set('passlink.connect.' + action.getParameter('id'), true);

        try {
            let login = await action.apply(),
                label = await this._getServerName(login, action);

            if(createServer) await this._createServer(login, action, label);

            reply.setPayload({success: true, message: label});
        } catch(e) {
            reply.setPayload({success: false, message: this._getErrorMessage(e)});
        }

        RegistryService.remove('passlink.action.connect');
    }

    /**
     *
     * @param {Object} login
     * @param {Connect} action
     * @param {String} label
     * @return {Promise<void>}
     */
    async _createServer(login, action, label) {
        let data       = {
                label,
                baseUrl: action.getParameters().baseUrl,
                user   : login.login,
                token  : login.token
            },
            validation = new ServerValidation(),
            result     = await validation.validate(data);

        if(!result.ok) throw new Error(result.message);

        let server = result.server;
        server.setEnabled(true);
        await ServerRepository.create(server);
        ServerManager.addServer(server)
                     .catch(ErrorManager.catch);
    }


    /**
     *
     * @param {Object} login
     * @param {Connect} action
     * @return {Promise<String>}
     */
    async _getServerName(login, action) {
        try {
            let theme = await action.getTheme();
            if(theme.hasOwnProperty('label')) {
                let label = `${theme.label} - ${login.login}`;
                if(label.length <= 48) return label;
            }
        } catch(e) {
            ErrorManager.logError(e);
        }

        let host = new URL(action.getParameter('baseUrl')).host;
        return `${login.login}@${host}`.substr(0,48);
    }

    /**
     *
     * @return {Promise<String>}
     * @private
     */
    async _getClientLabel() {
        return await SystemService.getUserAgent();
    }

    /**
     *
     * @param {Error} error
     * @return {string|*}
     * @private
     */
    _getErrorMessage(error) {
        if(error instanceof HttpError && (error.status === 404 || error.status === 424)) {
            return error.status === 404 ? 'PasslinkConnectNotFound':'PasslinkConnectRejected';
        } else if(error instanceof NetworkError) {
            return 'PasslinkConnectNetworkError';
        }

        return error.message;
    }
}