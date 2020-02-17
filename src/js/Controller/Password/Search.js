import AbstractController from '@js/Controller/AbstractController';
import TextQuery from '@js/Search/Query/TextQuery';

export default class Search extends AbstractController {

    /**
     *
     * @param {Message} message
     * @param {Message} reply
     */
    async execute(message, reply) {
        let input = message.getPayload().query,
            query = new TextQuery(input);

        reply.setType('password.items')
            .setPayload(query.execute());
    }
}