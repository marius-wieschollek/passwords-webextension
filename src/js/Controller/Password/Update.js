import AbstractController from '@js/Controller/AbstractController';
import SearchIndex from '@js/Search/Index/SearchIndex';
import ApiRepository from "@js/Repositories/ApiRepository";
import ToastService from "@js/Services/ToastService";
import ErrorManager from "@js/Manager/ErrorManager";
import ServerManager from '@js/Manager/ServerManager';

export default class Update extends AbstractController {

    async execute(message, reply) {
        let {data} = message.getPayload();
        data.edited = new Date();

        if(data.id === undefined) {
            this._returnError();
            return;
        }

        /** @type {EnhancedPassword} **/
        let model = SearchIndex.getItem(data.id);
        model.setProperties(data);       

        if(model !== null && !model.isTrashed()) {
            await this._updatePassword(model);
            reply.setPayload({success: true, data: data});
        } else {
            reply.setPayload({success: false});
            this._returnError()
        }
    }

    
    /**
     *
     * @param {EnhancedPassword} password
     * @private
     */
     async _updatePassword(password) {
        let api = /** @type {PasswordsClient} **/ await ApiRepository.findById(password.getServer().getId());
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