import ServerRepository from '@js/Repositories/ServerRepository';
import AbstractController from '@js/Controller/AbstractController';

export default class Update extends AbstractController {

    /**
     *
     * @param {Message} message
     * @param {Message} reply
     */
    async execute(message, reply) {


        reply.setType('validation.error')
            .setPayload({message: 'Not implemented'});
    }
}