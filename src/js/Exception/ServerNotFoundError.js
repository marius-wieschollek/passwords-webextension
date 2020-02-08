export default class ServerNotFoundError extends Error {
    constructor(id) {
        super(`The server with the id ${id} does not exist`);
    }
}