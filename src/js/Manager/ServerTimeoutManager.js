import ErrorManager from "@js/Manager/ErrorManager";
import ApiRepository from "@js/Repositories/ApiRepository";
import ServerManager from "@js/Manager/ServerManager";

export default class ServerTimeoutManager {

    constructor() {
        this._interval = setInterval(() => {
            this._checkAllClientTimeouts()
                .catch(ErrorManager.catchEvt);
        }, 5 * 60 * 1000);
        this._lastInteraction = Date.now();
    }

    /**
     * @returns {Promise<void>}
     * @private
     */
    async _checkAllClientTimeouts() {
        let clients = await ApiRepository.findAll();

        for(let client of clients) {
            this._checkClientTimeout(client)
                .catch(ErrorManager.catchEvt);
        }
    }

    /**
     *
     * @param {PasswordsClient} client
     * @returns {Promise<void>}
     * @private
     */
    async _checkClientTimeout(client) {
        let server = client.getServer();

        if(server.getEnabled() && server.getLockable() && server.getStatus() === server.STATUS_AUTHORIZED && server.getTimeout() > 0) {
            if(Date.now() - this._lastInteraction >= server.getTimeout()) {
                ServerManager
                    .restartSession(server)
                    .catch(ErrorManager.catchEvt);
            }
        }
    }
}