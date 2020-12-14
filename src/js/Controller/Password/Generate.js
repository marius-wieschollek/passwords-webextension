import AbstractController from '@js/Controller/AbstractController';
import ServerManager from '@js/Manager/ServerManager';
import ToastService from "@js/Services/ToastService";
import ErrorManager from "@js/Manager/ErrorManager";

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

            try {
                let data = await passwordService.generate(params.numbers, params.special, params.strength);

                reply.setPayload({success: true, password: data.password, words: data.words});
            } catch(e) {
                ErrorManager.logError(e);
                ToastService.create({message: ['PasswordGenerateError', e.message], ttl: 5, type: 'error'})
                    .catch(ErrorManager.catchEvt);
                reply.setPayload({success: false});
            }
    }
}