export default class ServerNotFoundError extends Error {

    /**
     * @returns {String}
     */
    get name() {
        return 'ServerNotFoundError';
    }

    /**
     * @param {String} id
     */
    constructor(id) {
        super(`The server with the id ${id} does not exist`);
    }
}