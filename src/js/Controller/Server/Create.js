import Server from '@js/Models/Server/Server';
import ServerRepository from '@js/Repositories/ServerRepository';
import ServerManager from '@js/Manager/ServerManager';
import ErrorManager from '@js/Manager/ErrorManager';
import AbstractController from '@js/Controller/AbstractController';
import ServerValidation from '@js/Validation/Server';

export default class Create extends AbstractController {

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

        let server = result.server;
        if(await this._createServer(server, result)) {
            ServerManager.addServer(server)
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
     * @returns {Promise<boolean>}
     * @private
     */
    async _createServer(server, result) {
        try {
            await ServerRepository.create(server);
            return true;
        } catch(e) {
            ErrorManager.logError(e);
            result.ok = false;
            result.message = e.message;
            return false;
        }
    }
}