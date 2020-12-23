export default class UnknownItemTypeError extends Error {

    /**
     * @returns {String}
     */
    get name() {
        return 'UnknownItemTypeError';
    }

    /**
     *
     * @returns {Object}
     */
    get item() {
        return this._item;
    }

    /**
     * @param {Object} item
     */
    constructor(item) {
        super('Unable to determine item type');
        this._item = item;
    }
}