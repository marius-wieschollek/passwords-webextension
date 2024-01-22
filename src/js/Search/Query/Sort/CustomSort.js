export default class CustomSort {

    /**
     *
     * @param {Function} callback
     */
    constructor(callback) {
        this._callback = callback;
    }

    /**
     *
     * @param {Match} a
     * @param {Match} b
     * @return {Number}
     */
    compare(a, b) {
        return this._callback(a, b);
    }
}