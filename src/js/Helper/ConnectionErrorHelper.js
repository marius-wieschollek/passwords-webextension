import ServerRepository from '@js/Repositories/ServerRepository';
import ErrorManager from '@js/Manager/ErrorManager';
import {HttpError, UnauthorizedError} from 'passwords-client/errors';
import ToastService from '@js/Services/ToastService';
import SystemService from '@js/Services/SystemService';
import ServerManager from "@js/Manager/ServerManager";

export default class ConnectionErrorHelper {


    /**
     *
     * @param {Error} error
     * @param {Server} server
     * @return {Promise<void>}
     * @private
     */
    async processError(error, server) {
        ErrorManager.logError(error);
        let title   = ['ServerConnectionErrorTitle', server.getLabel()],
            tags    = [server.getId(), 'server-error'],
            message = 'ServerUnknownError';

        if(error instanceof UnauthorizedError) {
            try {
                await this._disableServer(server);

                ToastService.create({message: 'ServerCredentialsRejected', title, tags, ttl: 0, type: 'error'})
                    .then((c) => {
                        if(c) SSystemService.getBrowserApi().runtime.openOptionsPage();
                    })
                    .catch(ErrorManager.catch);
            } catch(e) {
                ErrorManager.logError(e);
            }
            return;
        } else if(error instanceof HttpError) {
            message = ['ServerHttpError', error.message];
        } else if(error instanceof TypeError && (error.message.substr(0, 12) === 'NetworkError' || error.message === 'Failed to fetch')) {
            let options = {reload: 'ServerNetworkErrorReload'};

            ToastService.create({message: 'ServerNetworkError', title, tags, options, default: true, ttl: 0, type: 'error'})
                .then((c) => {
                    if(c === 'reload') {
                        this._reloadServer(server.getId()).catch(ErrorManager.catch);
                    } else if(c) {
                        SystemService.getBrowserApi().tabs.create({active: true, url: server.getBaseUrl()});
                    }
                })
                .catch(ErrorManager.catch);

            return;
        } else if(error instanceof Error) {
            message = ['ServerGenericError', error.message];
        }

        ToastService.create({message, title, tags, ttl: 5, type: 'error'}).catch(ErrorManager.catch);
    }

    /**
     * @param {Server} server
     * @return {Promise<void>}
     * @private
     */
    async _disableServer(server) {
        server.setEnabled(false);
        server.setStatus(server.STATUS_DISABLED);
        await ServerRepository.update(server);
    }

    /**
     * @param {String} serverId
     * @return {Promise<void>}
     * @private
     */
    async _reloadServer(serverId) {
        try {
            let server = await ServerRepository.findById(serverId);
            await ServerManager.reloadServer(server);
        } catch(e) {
            ErrorManager.logError(e);
        }
    }
}