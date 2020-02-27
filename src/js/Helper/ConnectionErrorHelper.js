import ServerRepository from '@js/Repositories/ServerRepository';
import ErrorManager from '@js/Manager/ErrorManager';
import UnauthorizedError from 'passwords-client/src/Exception/Http/UnauthorizedError';
import ToastService from '@js/Services/ToastService';
import SystemService from '@js/Services/SystemService';
import HttpError from 'passwords-client/src/Exception/Http/HttpError';

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
                    .then(() => {SystemService.getBrowserApi().runtime.openOptionsPage();})
                    .catch(ErrorManager.catch);
            } catch(e) {
                ErrorManager.logError(e);
            }
            return;
        } else if(error instanceof HttpError) {
            message = ['ServerHttpError', error.message];
        } else if(error instanceof TypeError && (error.message.substr(0, 12) === 'NetworkError' || error.message === 'Failed to fetch')) {
            ToastService.create({message: 'ServerNetworkError', title, tags, ttl: 0, type: 'error'})
                .then(() => {SystemService.getBrowserApi().tabs.create({active: true, url: server.getBaseUrl()});})
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
}