export default class ServerDisabledError extends Error {
    constructor() {
        super('Server disabled');
    }
}