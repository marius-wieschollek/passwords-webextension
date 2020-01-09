import ServerRepository from '@js/Repositories/ServerRepository';
import ServerManager from '@js/Manager/ServerManager';
import AbstractController from '@js/Controller/AbstractController';

export default class Delete extends AbstractController {

    /**
     *
     * @param {Message} message
     * @param {Message} reply
     */
    async execute(message, reply) {
        try {
            let server = await ServerRepository.findById(message.getPayload().server);
            await ServerManager.deleteServer(server);
            reply.setType('delete.success');
        } catch(e) {
            reply.setType('delete.failed')
                .setPayload({message: e.message});
        }
    }

}