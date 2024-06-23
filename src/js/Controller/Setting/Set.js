import AbstractController from '@js/Controller/AbstractController';
import SettingsService from '@js/Services/SettingsService';
import ServerRepository from '@js/Repositories/ServerRepository';
import ThemeRepository from '@js/Repositories/ThemeRepository';

export default class Set extends AbstractController {

    constructor() {
        super();
        this._booleanSettings = [
            'paste.popup.close',
            'paste.form.submit',
            'paste.compromised.warning',
            'paste.autofill',
            'paste.basic-auth',
            'popup.related.search',
            'notification.password.new',
            'notification.password.update',
            'notification.password.quicksave',
            'debug.localisation.enabled',
            'clipboard.clear.passwords',
            'password.list.show.user',
            'mining.incognito.hide'
        ];
    }

    /**
     *
     * @param {Message} message
     * @param {Message} reply
     * @return {Promise<void>}
     */
    async execute(message, reply) {
        let {setting, value} = message.getPayload();

        try {
            if(setting === 'theme.custom') {
                await SettingsService.set(setting, value);
            } else if(setting === 'server.default') {
                await this._setDefaultServer(value);
            } else if(setting === 'theme.current') {
                await this._setCurrentTheme(value);
            } else if(setting === 'search.recommendation.mode') {
                await this._setSearchRecommendationMode(value);
            } else if(setting === 'search.recommendation.maxRows') {
                await this._setSearchRecommendationMaxRows(Number(value));
            } else if(setting === 'clipboard.clear.delay') {
                await this._setClipboardClearDelay(Number(value));
            } else if(setting === 'mining.ignored-domains') {
                await this._setString(setting, value);
            } else if(setting === 'autofill.ignored-domains') {
                await this._setString(setting, value);
            } else if(this._booleanSettings.indexOf(setting) !== -1) {
                await this._setBoolean(setting, value);
            } else {
                reply.setPayload(
                    {
                        success: false,
                        message: 'Unknown setting'
                    }
                );
                return;
            }

            reply.setPayload({success: true});
        } catch(e) {
            reply.setPayload(
                {
                    success: false,
                    message: e.message
                }
            );
        }
    }

    /**
     *
     * @param {String} value
     * @return {Promise<void>}
     * @private
     */
    async _setDefaultServer(value) {
        await ServerRepository.findById(value);
        await SettingsService.set('server.default', value);
    }

    /**
     *
     * @param {String} value
     * @return {Promise<void>}
     * @private
     */
    async _setCurrentTheme(value) {
        await ThemeRepository.findById(value);
        await SettingsService.set('theme.current', value);
    }

    /**
     *
     * @param {String} value
     * @return {Promise<void>}
     * @private
     */
    async _setSearchRecommendationMode(value) {
        await SettingsService.set('search.recommendation.mode', value);
    }

    /**
     *
     * @param {Number} value
     * @return {Promise<void>}
     * @private
     */
    async _setSearchRecommendationMaxRows(value) {
        await SettingsService.set('search.recommendation.maxRows', value);
    }

    /**
     *
     * @param {String} setting
     * @param {Boolean} value
     * @return {Promise<void>}
     * @private
     */
    async _setBoolean(setting, value) {
        await SettingsService.set(setting, value === true);
    }

    /**
     *
     * @param {String} setting
     * @param {Boolean} value
     * @return {Promise<void>}
     * @private
     */
    async _setString(setting, value) {
        await SettingsService.set(setting, value.toLocaleString());
    }

    /**
     *
     * @param {Number} value
     * @return {Promise<void>}
     * @private
     */
    async _setClipboardClearDelay(value) {
        await SettingsService.set('clipboard.clear.delay', value);
    }
}