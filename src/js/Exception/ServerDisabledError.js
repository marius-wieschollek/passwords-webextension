export default class ServerDisabledError extends Error {

    /**
     * @returns {String}
     */
    get name() {
        return 'ServerDisabledError';
    }

    constructor() {
        super('Server disabled');
    }
}