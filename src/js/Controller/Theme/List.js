import AbstractController from '@js/Controller/AbstractController';
import ThemeRepository from '@js/Repositories/ThemeRepository';

export default class List extends AbstractController {

    async execute(message, reply) {
        let themes = await ThemeRepository.findAll();

        reply.setType('theme.items').setPayload(themes);
    }
}