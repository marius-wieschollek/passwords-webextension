import AbstractController from '@js/Controller/AbstractController';
import SystemService from "@js/Services/SystemService";

export default class OpenSettings extends AbstractController {

    async execute(message, reply) {
        SystemService.getBrowserApi().runtime.openOptionsPage();
    }
}