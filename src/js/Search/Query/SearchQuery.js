import FieldFactory from '@js/Search/Query/Field/FieldFactory';
import AndCondition from '@js/Search/Query/Condition/AndCondition';
import OrCondition from '@js/Search/Query/Condition/OrCondition';
import XorCondition from '@js/Search/Query/Condition/XorCondition';
import SearchIndex from '@js/Search/Index/SearchIndex';
import SortAscending from '@js/Search/Query/Sort/SortAscending';
import SortDescending from '@js/Search/Query/Sort/SortDescending';
import {ObjectMerger} from 'passwords-client/utility';

export default class SearchQuery {

    /**
     *
     * @param {String} [condition=and]
     */
    constructor(condition = 'and') {
        if(['and', 'or', 'xor'].indexOf(condition) === -1) {
            condition = 'and';
        }

        this._condition = this[condition]();
        this._hidden = false;
        this._sort = [];
        this._score = 0.2;
        this._limit = 0;
        this._type = null;
    }

    /**
     *
     * @param {Number} value
     * @return {SearchQuery}
     */
    limit(value) {
        this._limit = value;

        return this;
    }

    /**
     *
     * @param {Number} value
     * @return {SearchQuery}
     */
    score(value) {
        this._score = value;

        return this;
    }

    /**
     *
     * @param {(String|String[])} value
     * @return {SearchQuery}
     */
    type(value) {
        this._type = value;

        return this;
    }

    /**
     *
     * @param {Boolean} value
     * @return {SearchQuery}
     */
    hidden(value) {
        this._hidden = value;

        return this;
    }

    /**
     *
     * @param {String} field
     * @param {Boolean} ascending
     * @return {SearchQuery}
     */
    sortBy(field, ascending = false) {
        if(ascending) {
            this._sort.push(new SortAscending(field));
        } else {
            this._sort.push(new SortDescending(field));
        }

        return this;
    }

    /**
     *
     * @param {String} name
     * @returns {FieldFactory}
     */
    field(name) {
        return new FieldFactory(name);
    }

    /**
     *
     * @param {(AbstractField|AbstractCondition)} conditions
     * @returns {SearchQuery}
     */
    where(...conditions) {
        this._condition.where(...conditions);

        return this;
    }

    /**
     *
     * @param {(AbstractField|AbstractCondition)} conditions
     * @returns {AndCondition}
     */
    and(...conditions) {
        return new AndCondition(...conditions);
    }

    /**
     *
     * @param {(AbstractField|AbstractCondition)} conditions
     * @returns {OrCondition}
     */
    or(...conditions) {
        return new OrCondition(...conditions);
    }

    /**
     *
     * @param {(AbstractField|AbstractCondition)} conditions
     * @returns {XorCondition}
     */
    xor(...conditions) {
        return new XorCondition(...conditions);
    }

    /**
     * @return {AbstractModel[]}
     */
    execute() {
        let items   = SearchIndex.getIndexItems(this._type),
            matches = [];

        for(let item of items) {
            if(!this._hidden && item.hidden) continue;
            let result = this._condition.evaluate(item);

            if(result.passed) {
                let score = result.matches / result.checks;
                if(score >= this._score) {
                    let match = ObjectMerger.merge({score}, item);
                    matches.push(match);
                }
            }
        }

        if(this._sort.length === 0) {
            this.sortBy('score');
        }

        matches.sort(
            (a, b) => { return this._sortFunction(a, b); }
        );

        if(this._limit > 0 && matches.length > this._limit) {
            matches = matches.splice(0, this._limit);
        }

        let result = [];
        for(let match of matches) {
            result.push(SearchIndex.getItem(match.id));
        }

        return result;
    }

    /**
     *
     * @param {Object} a
     * @param {Object} b
     * @return {Number}
     * @private
     */
    _sortFunction(a, b) {
        for(let sort of this._sort) {
            let result = sort.compare(a, b);
            if(result !== 0) return result;
        }

        return 0;
    }
}