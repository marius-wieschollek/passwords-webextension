import AbstractController from '@js/Controller/AbstractController';
import ServerRepository from '@js/Repositories/ServerRepository';
import ServerManager from '@js/Manager/ServerManager';

export default class Reload extends AbstractController {

    async execute(message, reply) {
        let server = await ServerRepository.findById(message.getPayload());
        await ServerManager.reloadServer(server);
        reply.setPayload(true);
    }
}
