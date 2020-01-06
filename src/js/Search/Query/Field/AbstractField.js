export default class AbstractField {

    /**
     *
     * @param {String} name
     * @param {*} value
     */
    constructor(name, value) {
        this._name = name;
        this._value = value;
    }

    /**
     *
     * @return {String}
     */
    getName() {
        return this._name;
    }

    /**
     *
     * @return {*}
     */
    getValue() {
        return this._value;
    }

    /**
     *
     * @param {Object} item
     * @return {{checks: number, passed: boolean, matches: number}}
     */
    evaluate(item) {
        return {matches: 0, checks: 0, passed: false};
    }

    /**
     *
     * @param {Object} item
     * @return {(boolean|string[])}
     * @private
     */
    _getFieldValues(item) {
        if(item.hasOwnProperty(this._name)) {
            if(this._name === 'id' || this._name === 'type') {
                return [item[this._name]];
            }

            return item[this._name];
        }

        if(item.fields.hasOwnProperty(this._name)) {
            return item.fields[this._name];
        }

        return false;
    }
}