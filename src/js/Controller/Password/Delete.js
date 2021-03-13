import AbstractController from '@js/Controller/AbstractController';
import SearchIndex from '@js/Search/Index/SearchIndex';
import ApiRepository from "@js/Repositories/ApiRepository";
import ToastService from "@js/Services/ToastService";
import ErrorManager from "@js/Manager/ErrorManager";

export default class Delete extends AbstractController {

    async execute(message, reply) {
        let {id} = message.getPayload();

        /** @type {EnhancedPassword} **/
        let model = SearchIndex.getItem(id);

        if(model !== null && !model.isTrashed()) {
            SearchIndex.removeItem(model);
            let api = /** @type {PasswordsClient} **/ await ApiRepository.findById(model.getServer().getId());
            let repository = /** @type {PasswordRepository} **/ api.getInstance('repository.password');
            await repository.delete(model);

            reply.setPayload({success: true});
            if(!model.getHidden()) {
                this._crateTrashedNotification(repository, model)
                    .catch(ErrorManager.catch);
            } else {
                this._restoreOrDelete(repository, model);
            }
        } else {
            reply.setPayload({success: false});
        }
    }

    /**
     *
     * @param {PasswordRepository} repository
     * @param {EnhancedPassword} model
     * @returns {Promise<Boolean>}
     * @private
     */
    async _crateTrashedNotification(repository, model) {
        let toast    = {
                type     : model.getHidden() ? 'warning':'info',
                message  : [`ToastPassword${model.getHidden() ? 'Hidden':''}Trashed`, model.getLabel()],
                closeable: true,
                options  : {restore: 'ToastPasswordTrashedRestore', close: 'ButtonClose'},
                ttl      : model.getHidden() ? 10:5
            },
            response = await ToastService.create(toast);

        if(response === 'restore') {
            await repository.restore(model);
            SearchIndex.addItem(model);
            ToastService
                .success(['ToastPasswordRestored', model.getLabel()])
                .catch(ErrorManager.catch);

            return true;
        }

        return false;
    }

    /**
     *
     * @param {PasswordRepository} repository
     * @param {EnhancedPassword} model
     * @returns {Promise<void>}
     * @private
     */
    async _restoreOrDelete(repository, model) {
        if(!await this._crateTrashedNotification(repository, model)) {
            await repository.delete(model);
        }
    }
}