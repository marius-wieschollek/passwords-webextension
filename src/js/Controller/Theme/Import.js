import AbstractController from '@js/Controller/AbstractController';
import ThemeRepository from '@js/Repositories/ThemeRepository';
import ThemeSchema from '@js/Schema/ThemeSchema';
import Theme from "@js/Models/Theme/Theme";
import LocalisationService from "@js/Services/LocalisationService";

export default class Import extends AbstractController {

    async execute(message, reply) {
        let theme = message.getPayload();
        theme.type = 'custom';

        let validationResult = ThemeSchema(theme);
        if(!validationResult) {
            reply.setPayload({success: false, message: LocalisationService.translate('ThemeImportError', [this.#formatErrors(ThemeSchema)])});
            return;
        }

        await ThemeRepository.update(new Theme(theme));
        reply.setPayload({success: true});
    }

    /**
     *
     * @param ThemeSchema
     * @return {string}
     */
    #formatErrors(ThemeSchema) {
        let message = [];

        for(let error of ThemeSchema.errors) {
            message.push(error.message.capitalize());
        }

        return message.join(' ');
    }
}