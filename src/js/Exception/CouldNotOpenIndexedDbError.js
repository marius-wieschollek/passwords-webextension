export default class CouldNotOpenIndexedDbError  extends Error {

    /**
     * @returns {String}
     */
    get name() {
        return 'CouldNotOpenIndexedDbError';
    }

    /**
     * @param {String} name
     * @param {Number} version
     * @param {Error} error
     */
    constructor(name, version, error = null) {
        super(`Could not open database ${name}@${version}${error ? `: ${error.message}`:''}`);
        this.previousError = error;
    }
}