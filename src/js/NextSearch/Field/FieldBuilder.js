import FieldEquals      from '@js/NextSearch/Field/FieldEquals';
import FieldContains    from '@js/NextSearch/Field/FieldContains';
import FieldMatches     from '@js/NextSearch/Field/FieldMatches';
import FieldIn          from '@js/NextSearch/Field/FieldIn';
import FieldNotEquals   from '@js/NextSearch/Field/FieldNotEquals';
import FieldNotContains from '@js/NextSearch/Field/FieldNotContains';
import FieldNotMatches  from '@js/NextSearch/Field/FieldNotMatches';
import FieldNotIn       from '@js/NextSearch/Field/FieldNotIn';

export default class FieldBuilder {

    /**
     *
     * @param {String} field
     * @param {AbstractSearchCondition} condition
     * @param {ConditionBuilder} query
     */
    constructor(field, condition, query) {
        this._field = field;
        this._query = query;
        this._condition = condition;
    }

    /**
     *
     * @param {String} value
     * @returns {FieldBuilder}
     */
    equals(value) {
        this._condition.add(new FieldEquals(this._field, value));

        return this;
    }

    /**
     *
     * @param {String} value
     * @returns {FieldBuilder}
     */
    contains(value) {
        this._condition.add(new FieldContains(this._field, value));

        return this;
    }

    /**
     *
     * @param {String} value
     * @returns {FieldBuilder}
     */
    matches(value) {
        this._condition.add(new FieldMatches(this._field, value));

        return this;
    }

    /**
     *
     * @param {String[]} values
     * @returns {FieldBuilder}
     */
    in(values) {
        this._condition.add(new FieldIn(this._field, values));

        return this;
    }

    /**
     *
     * @param {String} value
     * @returns {FieldBuilder}
     */
    notEquals(value) {
        this._condition.add(new FieldNotEquals(this._field, value));

        return this;
    }

    /**
     *
     * @param {String} value
     * @returns {FieldBuilder}
     */
    notContains(value) {
        this._condition.add(new FieldNotContains(this._field, value));

        return this;
    }

    /**
     *
     * @param {String} value
     * @returns {FieldBuilder}
     */
    notMatches(value) {
        this._condition.add(new FieldNotMatches(this._field, value));

        return this;
    }

    /**
     *
     * @param {String[]} values
     * @returns {FieldBuilder}
     */
    notIn(values) {
        this._condition.add(new FieldNotIn(this._field, values));

        return this;
    }

    /**
     *
     * @param props
     * @returns {FieldBuilder|ConditionBuilder}
     */
    where(...props) {
        return this._query.where(...props);
    }

    /**
     *
     * @param props
     * @returns {FieldBuilder|ConditionBuilder}
     */
    and(...props) {
        return this._query.and(...props);
    }

    /**
     *
     * @param props
     * @returns {FieldBuilder|ConditionBuilder}
     */
    or(...props) {
        return this._query.or(...props);
    }

    /**
     *
     * @param props
     * @returns {FieldBuilder|ConditionBuilder}
     */
    xor(...props) {
        return this._query.xor(...props);
    }
}