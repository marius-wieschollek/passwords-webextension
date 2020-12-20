import AbstractController from '@js/Controller/AbstractController';
import SettingsService from '@js/Services/SettingsService';
import ServerRepository from '@js/Repositories/ServerRepository';
import ThemeRepository from '@js/Repositories/ThemeRepository';

export default class Set extends AbstractController {

    constructor() {
        super();
        this._booleanSettings = [
            'popup.autoclose',
            'password.autosubmit',
            'popup.related.search',
            'notification.password.new',
            'notification.password.update',
            'debug.localisation.enabled'
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
     * @param {String} setting
     * @param {Boolean} value
     * @return {Promise<void>}
     * @private
     */
    async _setBoolean(setting, value) {
        await SettingsService.set(setting, value === true);
    }
}