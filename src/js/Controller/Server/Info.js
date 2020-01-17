import AbstractController from '@js/Controller/AbstractController';
import SearchQuery from '@js/Search/Query/SearchQuery';

export default class Info extends AbstractController {

    /**
     * @inheritDoc
     */
    async execute(message, reply) {
        let serverId = message.getPayload(),
            info     = {};

        let query = new SearchQuery();
        query
            .type('password')
            .where(query.field('server').equals(serverId));

        info.passwords = query.execute().length;
        info.folders = query.type('folder').execute().length;
        info.tags = query.type('tag').execute().length;

        reply.setPayload(info);
    }
}