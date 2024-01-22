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
    append(...conditions) {
        this._conditions.push(...conditions);

        return this;
    }

    prepend(...conditions) {
        this._conditions.unshift(...conditions);

        return this;
    }

    /**
     *
     * @param {Object} item
     * @return {({checks: number, passed: boolean, matches: number}|{passed: false})}
     */
    evaluate(item) {
        return {matches: 0, checks: 0, passed: false}
    }
}