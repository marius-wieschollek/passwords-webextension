import ServerRepository from "@js/Repositories/ServerRepository";
import ErrorManager from "@js/Manager/ErrorManager";
import Setting from "passwords-client/src/Model/Setting/Setting";
import NotFoundError from "passwords-client/src/Exception/Http/NotFoundError";

export default class HiddenFolderHelper {

    /**
     * @param {Api} api
     * @returns {Promise<String>}
     */
    async getHiddenFolderId(api) {
        let folder = await this.getHiddenFolder(api);

        return folder.getId();
    }

    /**
     *
     * @param {Api} api
     * @returns {Promise<{EnhancedFolder}>}
     */
    async getHiddenFolder(api) {
        let folderId = await this._getFolderId(api);

        if(folderId === null) {
            return await this._createHiddenFolder(api);
        }

        return await this._loadHiddenFolder(api, folderId);
    }

    /**
     *
     * @param {Api} api
     * @returns {Promise<(String|null)>}
     * @private
     */
    async _getFolderId(api) {
        let server   = api.getServer(),
            folderId = server.getPrivateFolder();

        if(folderId) return folderId;

        /** @type {SettingRepository} **/
        let settingsRepository = api.getInstance('repository.setting'),
            settings           = await settingsRepository.findByName('client.ext.folder.private');

        if(settings.length) {
            let setting = settings.get(0);
            if(setting.getValue()) {
                server.setPrivateFolder(setting.getValue());
                ServerRepository
                    .update(server)
                    .catch(ErrorManager.catch);

                return setting.getValue();
            }
        }

        return null;
    }

    /**
     *
     * @param {Api} api
     * @returns {Promise<{Folder}>}
     * @private
     */
    async _createHiddenFolder(api) {
        let settingsRepository = api.getInstance('repository.setting'),
            server             = api.getServer(),
            folder             = api
                .getClass('model.folder')
                .setLabel('BrowserExtensionPrivateFolder')
                .setHidden(true);

        await api.getFolderRepository().create(folder);

        server.setPrivateFolder(folder.getId());
        ServerRepository
            .update(server)
            .catch(ErrorManager.catch);

        let setting = api.getClass('model.setting', 'ext.folder.private', folder.getId(), Setting.SCOPE_CLIENT);
        settingsRepository
            .set(setting)
            .catch(ErrorManager.catch);

        return folder;
    }

    /**
     *
     * @param {Api} api
     * @param {String} folderId
     * @returns {Promise<{EnhancedFolder}>}
     * @private
     */
    async _loadHiddenFolder(api, folderId) {
        try {
            return await api.getFolderRepository().findById(folderId, 'passwords');
        } catch(e) {
            if(e instanceof NotFoundError) {
                return await this._createHiddenFolder(api);
            }
            throw e;
        }
    }
}