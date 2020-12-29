import AbstractController from '@js/Controller/AbstractController';
import HiddenFolderHelper from "@js/Helper/HiddenFolderHelper";
import ErrorManager from "@js/Manager/ErrorManager";
import ServerManager from "@js/Manager/ServerManager";
import SettingsService from "@js/Services/SettingsService";
import SystemService from "@js/Services/SystemService";

export default class DebugData extends AbstractController {

    /**
     *
     * @param {Message} message
     * @param {Message} reply
     */
    async execute(message, reply) {
        let data = {
            hidden  : {id: null},
            settings: {localisations: false},
            app     : {
                version    : process.env.APP_VERSION,
                platform   : SystemService.getBrowserPlatform(),
                environment: process.env.NODE_ENV
            },
            platform: await SystemService.getBrowserInfo(),
        };

        try {
            let api    = await ServerManager.getDefaultApi(),
                helper = new HiddenFolderHelper();
            if(api.isAuthorized()) {
                data.hidden.id = await helper.getHiddenFolderId(api);
            } else {
                data.hidden.id = '-';
            }
        } catch(e) {
            ErrorManager.logError(e);
        }

        try {
            let value = await SettingsService.getValue('debug.localisation.enabled');
            data.settings.localize = !value;
        } catch(e) {
            ErrorManager.logError(e);
        }

        try {
            let manifest = SystemService.getBrowserApi().runtime.getManifest();
            if(manifest.hasOwnProperty('version')) data.app.version = manifest.version
        } catch(e) {
            ErrorManager.logError(e);
        }

        reply
            .setType('debug.data')
            .setPayload(data);
    }
}