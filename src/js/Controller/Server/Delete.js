import ServerRepository from '@js/Repositories/ServerRepository';

export default class Delete {

    /**
     *
     * @param {Message} message
     * @param {Message} reply
     */
    async execute(message, reply) {
        try {
            let server = await ServerRepository.findById(message.getPayload().server);
            await ServerRepository.delete(server);
            reply.setType('delete.success');
        } catch(e) {
            reply.setType('delete.failed')
                .setPayload({message: e.message});
        }
    }

}