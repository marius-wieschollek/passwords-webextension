export default class UnknownItemTypeError extends Error {
    get item() {
        return this._item;
    }

    constructor(item) {
        super('Unable to determine item type');
        this._item = item;
    }
}