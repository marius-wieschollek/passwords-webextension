import AbstractController from '@js/Controller/AbstractController';
import SearchIndex from '@js/Search/Index/SearchIndex';
import ApiRepository from "@js/Repositories/ApiRepository";
import ToastService from "@js/Services/ToastService";
import ErrorManager from "@js/Manager/ErrorManager";
import HiddenFolderHelper from "@js/Helper/HiddenFolderHelper";
import SearchQuery from '@js/Search/Query/SearchQuery';

export default class Update extends AbstractController {

    async execute(message, reply) {
        let {data} = message.getPayload(),
            query    = new SearchQuery(),
            password = /** @type {EnhancedPassword} **/ query
                .where(query.field('id').equals(data.id))
                .hidden(true|false)
                .execute()[0],
            api = /** @type {PasswordsClient} **/ await ApiRepository.findById(password.getServer().getId());

        if(password !== null && !password.isTrashed()) {
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
        } else {
            reply.setPayload({success: false});
            this._returnError()
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
        var updateEdited = false;
        for(var item in data) {
            if(item !== 'id' && item !== 'favorite') {
                updateEdited = true;
            }
        }
        return updateEdited ? new Date():password.getEdited();
     }

    /**
     *
     * @param {String} property
     * @param {JSON} data
     * @param {EnhancedPassword} password
     * @returns {String}
     * @private
     */
     async _setFolder(api, data, password) {
        if(!data.hasOwnProperty('hidden')) {
            return password.getFolder();
        }
        
        let helper = new HiddenFolderHelper();
        var hiddenFolder = await helper.getHiddenFolderId(api);
        if(data.hidden && password.getFolder() !== hiddenFolder) {
            return hiddenFolder;
        } else if(!data.hidden && password.getFolder() === hiddenFolder) {
            return "00000000-0000-0000-0000-000000000000";
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
        
        SearchIndex.removeItem(password);
        SearchIndex.addItem(password, true);
        ToastService.success('ToastPasswordUpdated')
                .catch(ErrorManager.catch);
    }

    /**
     *
     * @private
     */
    _returnError() {
        ToastService
                .error('ToastPasswordUpdateFailed')
                .catch(ErrorManager.catch);
    }

}