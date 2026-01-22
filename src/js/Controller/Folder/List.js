import AbstractController from '@js/Controller/AbstractController';
import TabManager from "@js/Manager/TabManager";
import SearchService from "@js/Services/SearchService";

export default class List extends AbstractController {

    async execute(message, reply) {
        let payload = message.getPayload();

        let query = SearchService
            .find(['password', 'folder'])
            .where('server', payload.server)
            .orWhere((qb) => {
                qb.andWhere(
                    [
                        ['type', '=', 'folder'],
                        ['parent', '=', payload.folder]
                    ]
                ).andWhere(
                    [
                        ['type', '=', 'password'],
                        ['folder', '=', payload.folder]
                    ]
                );
            })
            .sortBy('favorite')
            .sortBy('label', true)
            .transform((results) => {
                return results.reduce((items, model) => {
                    items[`${model.MODEL_TYPE}s`].push(model);
                    return items;
                }, {passwords: [], folders: []});
            });

        if(TabManager.get()?.tab.incognito) {
            query.withHidden(true);
        }

        let items = query.execute();

        reply.setType('folder.items').setPayload(items);
    }
}