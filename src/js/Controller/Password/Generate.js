import AbstractController from '@js/Controller/AbstractController';
import ServerManager from '@js/Manager/ServerManager';

export default class Generate extends AbstractController {

    /**
     *
     * @param {Message} message
     * @param {Message} reply
     */
    async execute(message, reply) {
        let api             = await ServerManager.getDefaultApi(),
            /** @type {PasswordService} **/
            passwordService = api.getInstance('service.password'),
            params          = message.getPayload();

        let data = await passwordService.generate(params.numbers, params.special, params.strength);

        reply.setPayload(data.password);
    }
}