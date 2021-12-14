export default class AbstractSearchSort {

    /**
     * @return {String}
     * @constructor
     */
    get TYPE() {
        return 'abstract';
    }

    /**
     * @return {String}
     */
    get field() {
        return this._field;
    }

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
     * @return {{field: String, type: string, ascending: boolean}}
     */
    export() {
        return {
            type     : 'sort',
            ascending: this.TYPE === 'ascending',
            field    : this._field
        };
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
        if(this._field === 'score') {
            return item.score;
        }

        return item.item.getProperty(this._field);
    }
}