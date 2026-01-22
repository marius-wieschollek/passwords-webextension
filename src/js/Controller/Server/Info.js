import AbstractController from '@js/Controller/AbstractController';
import TabManager from "@js/Manager/TabManager";
import ApiRepository from "@js/Repositories/ApiRepository";
import ErrorManager from "@js/Manager/ErrorManager";
import LocalisationService from "@js/Services/LocalisationService";
import SearchService from "@js/Services/SearchService";

export default class Info extends AbstractController {

    /**
     * @inheritDoc
     */
    async execute(message, reply) {
        let serverId = message.getPayload(),
            info     = {passwords: 0, folders: 0, tags: 0};

        await this._getServerInfo(serverId, info);
        info = this._getItemStatistics(serverId, info);

        reply.setPayload(info);
    }

    /**
     *
     * @param {String} serverId
     * @param {Object} info
     * @return {Object}
     * @private
     */
    _getItemStatistics(serverId, info) {
        let query = SearchService
            .find()
            .where('server', serverId)
            .transform((results) => {
                return results.reduce((items, model) => {
                    items[`${model.MODEL_TYPE}s`]++;
                    return items;
                }, info);
            });

        if(TabManager.get()?.tab.incognito) {
            query.withHidden(true);
        }

        return query.execute();
    }

    /**
     *
     * @param {String} serverId
     * @param {Object} info
     * @return {Promise<void>}
     * @private
     */
    async _getServerInfo(serverId, info) {
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
    }
}