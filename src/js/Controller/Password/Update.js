import AbstractController from '@js/Controller/AbstractController';
import ApiRepository from "@js/Repositories/ApiRepository";
import ErrorManager from "@js/Manager/ErrorManager";
import HiddenFolderHelper from "@js/Helper/HiddenFolderHelper";
import SearchService from "@js/Services/SearchService";

export default class Update extends AbstractController {

    async execute(message, reply) {
        let {data}    = message.getPayload(),
            /** @type {(EnhancedPassword|null)} **/
            password = SearchService.get(data.id);

        if(password === null) {
            reply.setPayload({success: false, message: 'ToastPasswordUpdateFailed'});
            return;
        }

        if(password.isTrashed()) {
            reply.setPayload({success: false, message: 'ToastPasswordUpdateFailed'});
            return;
        }

        let api = /** @type {PasswordsClient} **/ await ApiRepository.findById(password.getServer().getId());
        try {
            password
                .setFavorite(this._setProperty('favorite', data, password))
                .setLabel(this._setProperty('label', data, password))
                .setUserName(this._setProperty('username', data, password))
                .setPassword(this._setProperty('password', data, password))
                .setUrl(this._setProperty('url', data, password))
                .setEdited(this._setEdited(data, password))
                .setCustomFields(this._setProperty('customFields', data, password))
                .setNotes(this._setProperty('notes', data, password))
                .setFolder(await this._setFolder(api, data, password))
                .setHidden(this._setProperty('hidden', data, password));

            await this._updatePassword(api, password);
            reply.setPayload({success: true, data: data});
        } catch(e) {
            ErrorManager.logError(e);
            reply.setPayload({success: false, message: 'ToastPasswordUpdateFailed'});
        }
    }

    /**
     *
     * @param {String} property
     * @param {JSON} data
     * @param {EnhancedPassword} password
     * @returns {*}
     * @private
     */
    _setProperty(property, data, password) {
        if(data.hasOwnProperty(property)) {
            return data[property];
        } else {
            return password.getProperty(property);
        }
    }

    /**
     *
     * @param {JSON} data
     * @param {EnhancedPassword} password
     * @returns {Date}
     * @private
     */
    _setEdited(data, password) {
        let updateEdited = data.hasOwnProperty('password') && data.password !== password.getPassword();
        return updateEdited ? new Date():password.getEdited();
    }

    /**
     *
     * @param {PasswordsClient} api
     * @param {JSON} data
     * @param {EnhancedPassword} password
     * @returns {Promise<String>}
     * @private
     */
    async _setFolder(api, data, password) {
        if(!data.hasOwnProperty('hidden')) {
            return password.getFolder();
        }

        let helper = new HiddenFolderHelper();
        let hiddenFolder = await helper.getHiddenFolderId(api);
        if(data.hidden && password.getFolder() !== hiddenFolder) {
            return hiddenFolder;
        } else if(!data.hidden && password.getFolder() === hiddenFolder) {
            return '00000000-0000-0000-0000-000000000000';
        }
        return password.getFolder();
    }

    /**
     *
     * @param {PasswordsClient} api
     * @param {EnhancedPassword} password
     * @private
     */
    async _updatePassword(api, password) {
        let repository = /** @type {PasswordRepository} **/ api.getInstance('repository.password');
        await repository.update(password);
        password = await repository.findById(password.getId());

        SearchService.update(password);
    }
}