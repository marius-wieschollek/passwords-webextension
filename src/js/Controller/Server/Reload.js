import AbstractController from '@js/Controller/AbstractController';
import SearchManager from '@js/Manager/SearchManager';
import ServerRepository from '@js/Repositories/ServerRepository';

export default class Reload extends AbstractController {

    async execute(message, reply) {
        let server = await ServerRepository.findById(message.getPayload());
        await SearchManager.reloadServer(server);
        reply.setPayload(true);
    }
}
