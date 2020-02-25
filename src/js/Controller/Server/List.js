import ServerRepository from '@js/Repositories/ServerRepository';
import AbstractController from '@js/Controller/AbstractController';

export default class List extends AbstractController {

    /**
     *
     * @param {Message} message
     * @param {Message} reply
     */
    async execute(message, reply) {
        let payload = message.getPayload(),
            servers = await ServerRepository.findAll(),
            all     = payload && payload.all,
            results = [];
        for(let server of servers) {
            if(all || server.getEnabled()) results.push(server);
        }

        reply.setType('server.items')
            .setPayload(results);
    }
}