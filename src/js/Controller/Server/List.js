import ServerRepository from '@js/Repositories/ServerRepository';
import AbstractController from '@js/Controller/AbstractController';

export default class List extends AbstractController {

    /**
     *
     * @param {Message} message
     * @param {Message} reply
     */
    async execute(message, reply) {
        let servers = await ServerRepository.findAll();
        let results = [];
        for(let server of servers) {
            results.push(server);
        }

        reply.setType('server.items')
            .setPayload(results);
    }
}