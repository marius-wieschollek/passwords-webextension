import AbstractController from '@js/Controller/AbstractController';
import ApiRepository from '@js/Repositories/ApiRepository';
import RegistryService from '@js/Services/RegistryService';
import ErrorManager from '@js/Manager/ErrorManager';
import SystemService from '@js/Services/SystemService';
import ServerRepository from '@js/Repositories/ServerRepository';
import ThemeCssVarsHelper from '@js/Helper/ThemeCssVarsHelper';

export default class Theme extends AbstractController {

    /**
     * @param {Message} message
     * @param {Message} reply
     * @return {Promise<void>}
     */
    async execute(message, reply) {
        let server = message.getPayload(),
            theme  = await this._getTheme(server);

        reply.setType('server.theme').setPayload(theme);
    }

    /**
     * @param {String} server
     * @return {Promise<Object>}
     * @private
     */
    async _getTheme(server) {
        let key = `server.${server}.theme`;
        if(RegistryService.has(key)) {
            return RegistryService.get(key);
        } else {
            try {
                let theme = await this._fetchThemeFromApi(server);
                RegistryService.set(key, theme);

                return theme;
            } catch(e) {
                ErrorManager.logError(e);
                return await this._getDefaultTheme(server);
            }
        }
    }

    /**
     * @param {String} server
     * @return {Promise<{}>}
     * @private
     */
    async _fetchThemeFromApi(server) {
        let api        = await ApiRepository.findById(server),
            repository = api.getInstance('repository.setting'),
            collection = await repository.findByScope('server'),
            settings   = {};

        for(let setting of collection) {
            if(setting.name.substr(0, 5) === 'theme') {
                let key = setting.name.substring(6);
                settings[key] = setting.value;
            }
        }

        return ThemeCssVarsHelper.processTheme(settings);
    }

    /**
     * @param {String} serverId
     * @return {Promise<Object>}
     * @private
     */
    async _getDefaultTheme(serverId) {
        let server = await ServerRepository.findById(serverId);

        return ThemeCssVarsHelper.processTheme(
            {
                'app.icon': await SystemService.getBrowserApi().runtime.getURL('img/favicon-fallback.svg'),
                background: `${server.getBaseUrl()}core/img/background.png`,
                logo      : `${server.getBaseUrl()}core/img/logo/logo.svg`
            }
        );
    }
}