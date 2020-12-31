import AbstractController from '@js/Controller/AbstractController';
import TextQuery from '@js/Search/Query/TextQuery';
import TabManager from "@js/Manager/TabManager";

export default class Search extends AbstractController {

    /**
     *
     * @param {Message} message
     * @param {Message} reply
     */
    async execute(message, reply) {
        let input = message.getPayload().query,
            query = new TextQuery(input);

        if(TabManager.get().tab.incognito) {
            query.hidden(true);
        }

        reply.setType('password.items')
            .setPayload(query.execute());
    }
}