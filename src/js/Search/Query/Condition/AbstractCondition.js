export default class AbstractCondition {

    constructor(...conditions) {
        if(!Array.isArray(conditions)) conditions = [];

        this._conditions = conditions;
    }

    /**
     *
     * @param {(AbstractField|AbstractCondition)} conditions
     * @return {AbstractCondition}
     */
    where(...conditions) {
        this._conditions.push(...conditions);

        return this;
    }

    /**
     *
     * @param {Object} item
     * @return {{checks: number, passed: boolean, matches: number}}
     */
    evaluate(item) {
        return {matches: 0, checks: 0, passed: false}
    }
}