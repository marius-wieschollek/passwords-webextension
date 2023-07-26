import AbstractController from '@js/Controller/AbstractController';
import SearchIndex from '@js/Search/Index/SearchIndex';
import SystemService from '@js/Services/SystemService';
import ThemeService from '@js/Services/ThemeService';
import ErrorManager from "@js/Manager/ErrorManager";
import BlobToBase64Helper from "@js/Helper/BlobToBase64Helper";
import FaviconService from "@js/Services/FaviconService";

export default class Favicon extends AbstractController {

    async execute(message, reply) {
        let {password, size} = message.getPayload();

        reply.setPayload(await FaviconService.getFaviconForPassword(password, size))
    }
}