export default class AbstractField {

    get NO_MATCH_RESULT() {
        return {matches: 0, checks: 1, score: 0, passed: false};
    }

    /**
     *
     * @param {String} name
     * @param {*} value
     * @param {Number} weight
     */
    constructor(name, value, weight) {
        this._name = name;
        this._value = value;
        this._weight = weight;
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
     * @param {IndexEntry} item
     * @return {({checks: number, passed: boolean, matches: number}|{passed: false})}
     */
    evaluate(item) {
        return this.NO_MATCH_RESULT;
    }

    _createResult(checks, matches) {
        let passed = matches > 0,
            score  = passed ? (checks / matches) * this._weight:0;
        return {matches, checks, score, passed};
    }
}