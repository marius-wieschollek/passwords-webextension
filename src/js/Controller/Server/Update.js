import ServerRepository from '@js/Repositories/ServerRepository';

export default class Update {

    /**
     *
     * @param {Message} message
     * @param {Message} reply
     */
    async execute(message, reply) {


        reply.setType('validation.error')
            .setPayload({message: 'YOU SUCK'});
    }
}