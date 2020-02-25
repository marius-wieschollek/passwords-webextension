export default class ServerAccessError extends Error {

    /**
     * @return {Error}
     */
    get previousError() {
        return this._previousError;
    }

    /**
     * @param {Error} error
     */
    constructor(error) {
        super(error.message);
        this._previousError = error;
    }
}