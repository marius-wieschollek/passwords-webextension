import AbstractController from '@js/Controller/AbstractController';
import MiningManager from '@js/Manager/MiningManager';
import TabManager from "@js/Manager/TabManager";
import ErrorManager from "@js/Manager/ErrorManager";

export default class AddBlank extends AbstractController {
    async execute(message, reply) {
        let url   = TabManager.get('url'),
            title = TabManager.get('tab').title;

        MiningManager
            .createItem({title, url, manual: true, user: {value: ''}, password: {value: ''}})
            .catch(ErrorManager.catchEvt);
    }
}