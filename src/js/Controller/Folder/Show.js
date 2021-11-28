import AbstractController from '@js/Controller/AbstractController';
import SearchIndex from '@js/Search/Index/SearchIndex';
import {Folder} from 'passwords-client/models';

export default class Show extends AbstractController {
    async execute(message, reply) {
        let folderId = message.getPayload(),
            folder;

        if(folderId !== '00000000-0000-0000-0000-000000000000') {
            folder = SearchIndex.getItem(message.getPayload());
        } else {
            folder = new Folder({
                    label: 'Home',
                    id: '00000000-0000-0000-0000-000000000000',
                    parent: '00000000-0000-0000-0000-000000000000',
                    revision: '00000000-0000-0000-0000-000000000000'
                })
        }

        reply
            .setType('folder.item')
            .setPayload(folder);
    }
}