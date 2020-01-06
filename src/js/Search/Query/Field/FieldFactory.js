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
     * @param {string} name
     */
    constructor(name) {
        this._name = name;
    }

    /**
     *
     * @param {string} value
     * @param {string} [name=null]
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
     * @param {string} value
     * @param {string} [name=null]
     * @return {FieldContains}
     */
    contains(value, name = null) {
        if(!name) {
            name = this._name;
        }

        return new FieldContains(name, value);
    }

    /**
     *
     * @param {string} value
     * @param {string} [name=null]
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
     * @param {string[]} value
     * @param {string} [name=null]
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
     * @param {string} value
     * @param {string} [name=null]
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
     * @param {string} value
     * @param {string} [name=null]
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
     * @param {string} value
     * @param {string} [name=null]
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
     * @param {string[]} value
     * @param {string} [name=null]
     * @return {FieldNotIn}
     */
    notIn(value, name = null) {
        if(!name) {
            name = this._name;
        }

        return new FieldNotIn(name, value);
    }
}