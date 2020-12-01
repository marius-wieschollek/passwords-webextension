import ServerRepository from "@js/Repositories/ServerRepository";
import ErrorManager from "@js/Manager/ErrorManager";
import Setting from "passwords-client/src/Model/Setting/Setting";

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
     * @returns {Promise<EnhancedFolder>}
     */
    async getHiddenFolder(api) {
        let server   = api.getServer(),
            folderId = server.getPrivateFolder();

        if(folderId) return await api.getFolderRepository().findById(folderId);

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

                return await api.getFolderRepository().findById(setting.getValue());
            }
        }

        let folder = api.getClass('model.folder');
        folder.setLabel('BrowserExtensionPrivateFolder')
              .setHidden(true);

        await api.getFolderRepository().create(folder);

        server.setPrivateFolder(folder.getId());
        ServerRepository
            .update(server)
            .catch(ErrorManager.catch);

        let setting = api.getClass('model.setting', 'ext.folder.private', folder.getId(), Setting.SCOPE_CLIENT);
        settingsRepository.set(setting)
                          .catch(ErrorManager.catch);

        return folder;
    }
}