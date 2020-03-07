import AbstractController from '@js/Controller/AbstractController';
import ThemeRepository from '@js/Repositories/ThemeRepository';

export default class Show extends AbstractController {
    async execute(message, reply) {
        try {
            let theme = await ThemeRepository.findById(message.getPayload());
            reply.setType('theme.item').setPayload(theme);
        } catch(e) {
            reply.setType('error');
        }
    }
}