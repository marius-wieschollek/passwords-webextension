import AbstractController from '@js/Controller/AbstractController';
import ServerValidation from '@js/Validation/Server';
import ErrorManager from '@js/Manager/ErrorManager';
import ServerRepository from '@js/Repositories/ServerRepository';
import SearchManager from '@js/Manager/SearchManager';
import ServerManager from '@js/Manager/ServerManager';

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
                .setUser(server.getUser())
                .setToken(server.getToken())
                .setLabel(server.getLabel())
                .setBaseUrl(server.getBaseUrl());
            await ServerRepository.update(server);

            return realServer;
        } catch(e) {
            ErrorManager.logError(e);
            result.ok = false;
            result.message = e.message;
            return false;
        }
    }
}