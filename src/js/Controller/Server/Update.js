import AbstractController from '@js/Controller/AbstractController';
import ServerValidation from '@js/Validation/Server';
import ErrorManager from '@js/Manager/ErrorManager';
import ServerRepository from '@js/Repositories/ServerRepository';
import ServerManager from '@js/Manager/ServerManager';
import ToastService from '@js/Services/ToastService';

export default class Update extends AbstractController {

    /**
     *
     * @param {Message} message
     * @param {Message} reply
     */
    async execute(message, reply) {
        let data       = message.getPayload(),
            validation = new ServerValidation(),
            result     = await validation.validate(data);

        if(!result.ok) {
            reply.setType('validation.error').setPayload(result);
            return;
        }

        let server = await this._createServer(result.server, result);
        if(server) {
            ServerManager.reloadServer(server)
                .catch(ErrorManager.catch);
            ToastService.closeByTags(server.getId(), 'login-error');
            reply.setType('server.item').setPayload(server);
        } else {
            reply.setType('validation.error').setPayload(result);
        }
    }

    /**
     *
     * @param {Server} server
     * @param {Object} result
     * @returns {Promise<(Server|Boolean)>}
     * @private
     */
    async _createServer(server, result) {
        try {
            let realServer = await ServerRepository.findById(server.getId());
            realServer
                .setEnabled(true)
                .setUser(server.getUser())
                .setToken(server.getToken())
                .setLabel(server.getLabel())
                .setBaseUrl(server.getBaseUrl());
            await ServerRepository.update(realServer);

            return realServer;
        } catch(e) {
            ErrorManager.logError(e);
            result.ok = false;
            result.message = e.message;
            return false;
        }
    }
}