import FieldEquals from '@js/Search/Query/Field/FieldEquals';
import FieldContains from '@js/Search/Query/Field/FieldContains';
import FieldMatches from '@js/Search/Query/Field/FieldMatches';
import FieldIn from '@js/Search/Query/Field/FieldIn';
import FieldNotEquals from '@js/Search/Query/Field/FieldNotEquals';
import FieldNotIn from '@js/Search/Query/Field/FieldNotIn';
import FieldNotMatches from '@js/Search/Query/Field/FieldNotMatches';
import FieldNotContains from '@js/Search/Query/Field/FieldNotContains';

export default class FieldFactory {

    /**
     * @param {String} name
     */
    constructor(name) {
        this._name = name;
    }

    /**
     *
     * @param {*} value
     * @param {String} [name=null]
     * @return {FieldEquals}
     */
    equals(value, name = null) {
        if(!name) {
            name = this._name;
        }

        return new FieldEquals(name, value);
    }

    /**
     *
     * @param {String} value
     * @param {Number} [weight=null]
     * @param {String} [name=null]
     * @return {FieldContains}
     */
    contains(value, weight = null, name = null) {
        if(!name) {
            name = this._name;
        }

        return new FieldContains(name, value, weight);
    }

    /**
     *
     * @param {String} value
     * @param {String} [name=null]
     * @return {FieldMatches}
     */
    matches(value, name = null) {
        if(!name) {
            name = this._name;
        }

        return new FieldMatches(name, value);
    }

    /**
     *
     * @param {String[]} value
     * @param {String} [name=null]
     * @return {FieldIn}
     */
    in(value, name = null) {
        if(!name) {
            name = this._name;
        }

        return new FieldIn(name, value);
    }

    /**
     *
     * @param {String} value
     * @param {String} [name=null]
     * @return {FieldNotEquals}
     */
    notEquals(value, name = null) {
        if(!name) {
            name = this._name;
        }

        return new FieldNotEquals(name, value);
    }

    /**
     *
     * @param {String} value
     * @param {String} [name=null]
     * @return {FieldNotContains}
     */
    notContains(value, name = null) {
        if(!name) {
            name = this._name;
        }

        return new FieldNotContains(name, value);
    }

    /**
     *
     * @param {String} value
     * @param {String} [name=null]
     * @return {FieldNotMatches}
     */
    notMatches(value, name = null) {
        if(!name) {
            name = this._name;
        }

        return new FieldNotMatches(name, value);
    }

    /**
     *
     * @param {String[]} value
     * @param {String} [name=null]
     * @return {FieldNotIn}
     */
    notIn(value, name = null) {
        if(!name) {
            name = this._name;
        }

        return new FieldNotIn(name, value);
    }
}