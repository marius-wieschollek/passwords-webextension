export default class AbstractSort {

    /**
     *
     * @param {String} field
     */
    constructor(field) {
        this._field = field;
    }

    /**
     *
     * @param {Match} a
     * @param {Match} b
     * @return {Number}
     */
    compare(a, b) {
        let valueA = this._getFieldValue(a),
            valueB = this._getFieldValue(b);

        return this._compareValues(valueA, valueB);
    }

    /**
     *
     * @param {*} a
     * @param {*} b
     * @return {Number}
     * @private
     */
    _compareValues(a, b) {
        return 0;
    }

    /**
     *
     * @param {Match} item
     * @return {*}
     * @private
     */
    _getFieldValue(item) {
        let values = item.getField(this._field);
        if (values === null || values.length === 0) return null;
        if (values.length === 1) return values.first();

        return typeof values[0] === 'number' ? values.reduce((a, c) => a + c, 0) : values.join();
    }
}