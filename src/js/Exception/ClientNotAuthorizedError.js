export default class ClientNotAuthorizedError extends Error {

    /**
     * @returns {String}
     */
    get name() {
        return 'ClientNotAuthorizedError';
    }

    /**
     * @returns {PasswordsClient}
     */
    get client() {
        return this._client;
    }

    /**
     * @param {PasswordsClient} client
     */
    constructor(client) {
        let name = 'Client';
        if(client.getServer()) name += ' ' + client.getServer().getLabel();

        super(`${name} is not authorized`);
        this._client = client;
    }
}