export default class AbstractSearchField {

    /**
     * @return {String}
     * @constructor
     */
    get TYPE() {
        return 'abstract';
    }

    /**
     *
     * @param {String} field
     * @param {*} value
     */
    constructor(field, value) {
        this._name = field;
        this._value = value;
    }

    /**
     *
     * @param {AbstractModel} item
     * @return {({checks: number, passed: boolean, matches: number}|{passed: false})}
     */
    evaluate(item) {
        return {matches: 0, checks: 0, passed: false};
    }

    /**
     * @return {{field: String, type: String, value: *, operator: String}}
     */
    export() {
        return {
            type    : 'field',
            operator: this.TYPE,
            value   : this._value,
            field   : this._name
        };
    }
}