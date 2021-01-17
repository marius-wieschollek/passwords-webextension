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
     * @param {Object} a
     * @param {Object} b
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
     * @param {Object} item
     * @return {*}
     * @private
     */
    _getFieldValue(item) {
        let values = [];
        if(item.hasOwnProperty(this._field)) {
            if(this._field === 'id' || this._field === 'type' || this._field === 'score' || this._field === 'hidden' || this._field === 'uses') {
                return item[this._field];
            }

            values = item[this._field];
        } else if(item.fields.hasOwnProperty(this._field)) {
            values = item.fields[this._field];
        }

        if(values.length === 0) return null;
        if(values.length === 1) return values.first();

        return values.join();
    }
}