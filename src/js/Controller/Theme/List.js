import AbstractController from '@js/Controller/AbstractController';
import ThemeRepository from '@js/Repositories/ThemeRepository';

export default class List extends AbstractController {

    async execute(message, reply) {
        let themes = await ThemeRepository.findAll(),
            list   = {};

        for(let theme of themes) list[theme.getId()] = theme.getLabel();

        reply.setType('theme.info').setPayload(list);
    }
}