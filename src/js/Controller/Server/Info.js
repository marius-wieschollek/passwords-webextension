import AbstractController from '@js/Controller/AbstractController';
import SearchQuery from '@js/Search/Query/SearchQuery';
import TabManager from "@js/Manager/TabManager";
import ApiRepository from "@js/Repositories/ApiRepository";
import ErrorManager from "@js/Manager/ErrorManager";
import LocalisationService from "@js/Services/LocalisationService";

export default class Info extends AbstractController {

    /**
     * @inheritDoc
     */
    async execute(message, reply) {
        let serverId = message.getPayload(),
            info     = {};

        try {
            /** @type {PasswordsClient} **/
            let client             = await ApiRepository.findById(serverId),
                /** @type {SettingRepository} **/
                settingsRepository = client.getInstance('repository.setting'),
                /** @type {SettingCollection} **/
                settings           = await settingsRepository.findByNames(['server.version', 'server.app.version']);

            info.serverVersion = LocalisationService.translate('ServerLabelString', settings.get('server.version').getValue());
            info.appVersion = LocalisationService.translate('AppLabelString', settings.get('server.app.version').getValue());
        } catch(e) {
            ErrorManager.logError(e);
        }

        let query = new SearchQuery();
        query
            .type('password')
            .where(query.field('server').equals(serverId));

        if(TabManager.get().tab.incognito) {
            query.hidden(true);
        }

        info.passwords = query.execute().length;
        info.folders = query.type('folder').execute().length;
        info.tags = query.type('tag').execute().length;

        reply.setPayload(info);
    }
}