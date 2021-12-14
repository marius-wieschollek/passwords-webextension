import FieldBuilder from '@js/NextSearch/Field/FieldBuilder';
import AndCondition from '@js/NextSearch/Condition/AndCondition';
import OrCondition  from '@js/NextSearch/Condition/OrCondition';
import XorCondition from '@js/NextSearch/Condition/XorCondition';

export default class ConditionBuilder {

    /**
     *
     * @param {AbstractSearchCondition} condition
     */
    constructor(condition) {
        this._condition = condition;
    }

    /**
     *
     * @param {(String|Function)} [param]
     * @returns {FieldBuilder|ConditionBuilder}
     */
    where(param) {
        if(typeof param === 'string') {
            return new FieldBuilder(param, this._condition, this);
        } else if(typeof param === 'function') {
            param(this);
        }

        return this;
    }

    /**
     *
     * @param {(String|Function)} [param]
     * @returns {FieldBuilder|ConditionBuilder}
     */
    and(param) {
        return this._createCondition(param, AndCondition);
    }

    /**
     *
     * @param {(String|Function)} [param]
     * @returns {FieldBuilder|ConditionBuilder}
     */
    or(param) {
        return this._createCondition(param, OrCondition);
    }

    /**
     *
     * @param {(String|Function)} [param]
     * @returns {FieldBuilder|ConditionBuilder}
     */
    xor(param) {
        return this._createCondition(param, XorCondition);
    }

    /**
     *
     * @param param
     * @param conditionClass
     * @returns {FieldBuilder|ConditionBuilder}
     * @private
     */
    _createCondition(param, conditionClass) {
        let condition = new conditionClass(),
            builder   = new ConditionBuilder(condition);

        this._condition.add(condition);
        if(typeof param === 'string') {
            return builder.where(param);
        } else if(typeof param === 'function') {
            param(builder);
            return this;
        }

        return builder;
    }
}