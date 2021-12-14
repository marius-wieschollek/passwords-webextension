export default class AbstractSearchCondition {

    /**
     * @return {String}
     * @constructor
     */
    get TYPE() {
        return 'abstract';
    }

    /**
     * @return {Number}
     */
    get length() {
        return this._conditions.length;
    }

    /**
     *
     * @return {(AbstractSearchCondition|AbstractSearchField)[]}
     */
    get conditions() {
        return this._conditions;
    }

    /**
     * @param {(AbstractSearchCondition|AbstractSearchField)[]} value
     */
    set conditions(value) {
        this._conditions = value;
    }

    /**
     *
     * @param {AbstractSearchCondition|AbstractSearchField} conditions
     */
    constructor(...conditions) {
        if(!Array.isArray(conditions)) conditions = [];

        this._conditions = conditions;
    }

    /**
     *
     * @param {(AbstractSearchField|AbstractSearchCondition)} conditions
     * @return {AbstractSearchCondition}
     */
    add(...conditions) {
        this._conditions.push(...conditions);

        return this;
    }

    /**
     *
     * @param {Object} item
     * @return {({checks: number, passed: boolean, matches: number}|{passed: false})}
     */
    evaluate(item) {
        return {matches: 0, checks: 0, passed: false};
    }

    /**
     *
     * @return {{type: String, conditions: [], operator: String}}
     */
    export() {
        let data = {
            type      : 'condition',
            operator  : this.TYPE,
            conditions: []
        };

        for(let condition of this._conditions) {
            data.conditions.push(condition.export());
        }

        return data;
    }
}