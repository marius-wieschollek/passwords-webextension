import ServerRepository from "@js/Repositories/ServerRepository";
import ErrorManager from "@js/Manager/ErrorManager";
import NotFoundError from "passwords-client/src/Exception/Http/NotFoundError";
import SettingsService from "@js/Services/SettingsService";
import ClientNotAuthorizedError from "@js/Exception/ClientNotAuthorizedError";
import LocalisationService from "@js/Services/LocalisationService";

export default class HiddenFolderHelper {

    /**
     * @param {PasswordsClient} api
     * @returns {Promise<String>}
     */
    async getHiddenFolderId(api) {
        let folder = await this.getHiddenFolder(api);

        return folder.getId();
    }

    /**
     *
     * @param {PasswordsClient} api
     * @returns {Promise<EnhancedFolder>}
     */
    async getHiddenFolder(api) {
        if(!api.isAuthorized()) {
            throw new ClientNotAuthorizedError(api);
        }

        let folderId = await this._getFolderId(api);

        if(folderId === null) {
            return await this._createHiddenFolder(api);
        }

        return await this._loadHiddenFolder(api, folderId);
    }

    /**
     *
     * @param {PasswordsClient} api
     * @returns {Promise<(String|null)>}
     * @private
     */
    async _getFolderId(api) {
        let server   = api.getServer(),
            folderId = server.getPrivateFolder();

        if(folderId) return folderId;

        let folderSetting = await SettingsService.getValue('password.folder.private');
        if(folderSetting !== null) {
            server.setPrivateFolder(folderSetting);
            ServerRepository
                .update(server)
                .catch(ErrorManager.catch);

            return folderSetting;
        }

        return null;
    }

    /**
     *
     * @param {PasswordsClient} api
     * @returns {Promise<(EnhancedFolder|Folder)>}
     * @private
     */
    async _createHiddenFolder(api) {
        let server = api.getServer(),
            folder = api
                .getClass('model.folder')
                .setLabel(this._getLabel())
                .setHidden(true);

        await api.getFolderRepository().create(folder);

        server.setPrivateFolder(folder.getId());
        ServerRepository
            .update(server)
            .catch(ErrorManager.catch);

        SettingsService
            .set('password.folder.private', folder.getId())
            .catch(ErrorManager.catchEvt);

        return folder;
    }

    /**
     *
     * @param {PasswordsClient} api
     * @param {String} folderId
     * @returns {Promise<EnhancedFolder>}
     * @private
     */
    async _loadHiddenFolder(api, folderId) {
        try {
            /** @type {Folder} **/
            let folder = await api.getFolderRepository().findById(folderId, 'model+passwords');
            if(folder.getLabel() !== this._getLabel()) {
                folder.setLabel(this._getLabel());
                await api.getFolderRepository().update(folder).catch(ErrorManager.catchEvt);
            }
            return folder;
        } catch(e) {
            if(e instanceof NotFoundError) {
                return await this._createHiddenFolder(api);
            }
            throw e;
        }
    }

    /**
     * @returns {String}
     * @private
     */
    _getLabel() {
        return LocalisationService.translate('PrivatePasswordsFolderLabel');
    }
}