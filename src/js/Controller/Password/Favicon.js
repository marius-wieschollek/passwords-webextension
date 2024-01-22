import AbstractController from '@js/Controller/AbstractController';
import FaviconService from "@js/Services/FaviconService";

export default class Favicon extends AbstractController {

    async execute(message, reply) {
        let {password, size} = message.getPayload();

        reply.setPayload(await FaviconService.getFaviconForPassword(password, size))
    }
}