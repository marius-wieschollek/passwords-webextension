import AbstractController from '@js/Controller/AbstractController';
import HiddenFolderHelper from "@js/Helper/HiddenFolderHelper";
import ErrorManager from "@js/Manager/ErrorManager";
import SettingsService from "@js/Services/SettingsService";
import SystemService from "@js/Services/SystemService";
import ApiRepository from "@js/Repositories/ApiRepository";

export default class ExtensionInfo extends AbstractController {

    /**
     *
     * @param {Message} message
     * @param {Message} reply
     */
    async execute(message, reply) {
        let data = {
            hidden  : [],
            settings: {localisations: false},
            app     : {
                version    : process.env.APP_VERSION,
                platform   : SystemService.getBrowserPlatform(),
                environment: process.env.NODE_ENV
            },
            platform: await SystemService.getBrowserInfo()
        };
        await this._getHiddenFolders(data);

        try {
            let value = await SettingsService.getValue('debug.localisation.enabled');
            data.settings.localize = !value;
        } catch(e) {
            ErrorManager.logError(e);
        }

        try {
            let manifest = SystemService.getBrowserApi().runtime.getManifest();
            if(manifest.hasOwnProperty('version')) data.app.version = manifest.version;
        } catch(e) {
            ErrorManager.logError(e);
        }

        reply
            .setType('debug.data')
            .setPayload(data);
    }

    async _getHiddenFolders(data) {
        try {
            let apis   = await ApiRepository.findAll(),
                helper = new HiddenFolderHelper();

            for(let api of apis) {
                if(api.isAuthorized()) {
                    let id = await helper.getHiddenFolderId(api);
                    data.hidden.push(
                        {
                            id,
                            label: api.getServer().getLabel(),
                            link : `${api.getServer().getBaseUrl()}apps/passwords/#/folders/${data.hidden.id}`
                        }
                    );
                }
            }
        } catch(e) {
            ErrorManager.logError(e);
        }
    }
}