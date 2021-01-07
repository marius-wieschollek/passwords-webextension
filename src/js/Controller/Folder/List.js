import AbstractController from '@js/Controller/AbstractController';
import SearchQuery from '@js/Search/Query/SearchQuery';
import TabManager from "@js/Manager/TabManager";

export default class List extends AbstractController {

    async execute(message, reply) {
        let payload = message.getPayload(),
            query   = new SearchQuery();

        query
            .where(
                query.field('folder').equals(payload.folder),
                query.field('server').equals(payload.server)
            )
            .type('password')
            .sortBy('favorite')
            .sortBy('label', true);

        if(TabManager.get().tab.incognito) {
            query.hidden(true);
        }

        let passwords = query.execute(),
            folders = query.type('folder').execute();

        reply.setType('folder.items').setPayload({passwords, folders});
    }
}