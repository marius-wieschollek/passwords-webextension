import AbstractController from '@js/Controller/AbstractController';
import SystemService from '@js/Services/SystemService';

export default class Status extends AbstractController {

    /**
     *
     * @param {Message} message
     * @param {Message} reply
     */
    async execute(message, reply) {
        let info   = await SystemService.getBrowserInfo(),
            status = {device: info.device, browser: info.name.replace(/\W+/g, '-').toLowerCase() };

        reply
            .setType('options.data')
            .setPayload(status);
    }
}