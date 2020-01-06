import ServerRepository from '@js/Repositories/ServerRepository';

export default class List {

    /**
     *
     * @param {Message} message
     * @param {Message} reply
     */
    async execute(message, reply) {
        let servers = await ServerRepository.list();
        let results = [];
        for(let server of servers) {
            results.push(server);
        }

        reply.setType('server.items')
            .setPayload(results);
    }
}