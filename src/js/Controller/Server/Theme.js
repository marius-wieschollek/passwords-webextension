import AbstractController from '@js/Controller/AbstractController';
import ApiRepository from '@js/Repositories/ApiRepository';

export default class Theme extends AbstractController {
    async execute(message, reply) {
        let server     = message.getPayload(),
            api        = await ApiRepository.findById(server),
            repository = api.getInstance('repository.setting'),
            collection = await repository.findByScope('server'),
            settings   = {};

        for(let setting of collection) {
            if(setting.name.substr(0, 5) === 'theme') {
                let key = setting.name.substring(6);
                settings[key] = setting.value;
            }
        }

        reply.setType('server.theme').setPayload(settings);
    }
}