import AndCondition     from '@js/NextSearch/Condition/AndCondition';
import OrCondition      from '@js/NextSearch/Condition/OrCondition';
import XorCondition     from '@js/NextSearch/Condition/XorCondition';
import SortAscending    from '@js/NextSearch/Sort/SortAscending';
import SortDescending   from '@js/NextSearch/Sort/SortDescending';
import ConditionBuilder from '@js/NextSearch/Condition/ConditionBuilder';

export default class Search {

    /**
     *
     * @return {Boolean}
     */
    get sorted() {
        return this._sort.length !== 0;
    }

    /**
     *
     * @return {Boolean}
     */
    get filtered() {
        return this._condition.length !== 0;
    }

    /**
     *
     * @return {AbstractSearchSort[]}
     */
    get sort() {
        return this._sort;
    }

    /**
     *
     * @param {AbstractSearchSort[]} value
     */
    set sort(value) {
        this._sort = value;
    }

    /**
     *
     * @return {AbstractSearchCondition[]}
     */
    get conditions() {
        return this._condition.conditions;
    }

    /**
     *
     * @param {AbstractSearchCondition[]} value
     */
    set conditions(value) {
        this._condition.conditions = value;
    }

    /**
     * @return {Number}
     */
    get limit() {
        return this._limit;
    }

    /**
     * @param {Number} value
     */
    set limit(value) {
        this._limit = value;
    }

    /**
     * @return {Number}
     */
    get score() {
        return this._score;
    }

    /**
     * @param {Number} value
     */
    set score(value) {
        this._score = value;
    }

    get type() {
        return this._condition.TYPE;
    }

    /**
     *
     * @param value
     */
    set type(value) {
        let conditions = this.conditions;
        this._condition = this._makeCondition(value);
        this._builder = new ConditionBuilder(this._condition);
        this.conditions = conditions;
    }

    /**
     *
     * @param {String} [condition=and]
     */
    constructor(condition = 'and') {
        this._condition = this._makeCondition(condition);
        this._builder = new ConditionBuilder(this._condition);
        this._sort = [];
        this._score = 0;
        this._limit = 0;
    }

    clear() {
        this._condition.conditions = [];
        this._sort = [];
        this._score = 0;
        this._limit = 0;
    }

    /**
     * @api
     * @public
     *
     * @param {String} field
     * @param {Boolean} ascending
     * @return {Search}
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
     * @param props
     * @returns {FieldBuilder|ConditionBuilder}
     */
    where(...props) {
        return this._builder.where(...props);
    }

    /**
     *
     * @param props
     * @returns {FieldBuilder|ConditionBuilder}
     */
    and(...props) {
        return this._builder.and(...props);
    }

    /**
     *
     * @param props
     * @returns {FieldBuilder|ConditionBuilder}
     */
    or(...props) {
        return this._builder.or(...props);
    }

    /**
     *
     * @param props
     * @returns {FieldBuilder|ConditionBuilder}
     */
    xor(...props) {
        return this._builder.xor(...props);
    }

    /**
     * @api
     * @public
     *
     * @param {(AbstractView|AbstractCollection)} view
     *
     * @return {AbstractModel[]}
     */
    execute(view) {
        let items   = view.getClone(),
            matches = [];

        for(let item of items) {
            let result = this._condition.evaluate(item);

            if(result.passed) {
                let score = result.checks === 0 ? 0 : result.matches / result.checks;
                if(score >= this._score) {
                    matches.push({item, score});
                }
            }
        }

        if(matches.length !== 0 && this._sort.length !== 0) {
            matches.sort(
                (a, b) => { return this._sortFunction(a, b); }
            );
        }

        if(this._limit > 0 && matches.length > this._limit) {
            matches = matches.splice(0, this._limit);
        }

        let result = [];
        for(let match of matches) {
            result.push(match.item);
        }

        return result;
    }

    /**
     *
     * @return {{score: Number, condition: {type: String, conditions: *[], operator: String}, limit: Number, sort: []}}
     */
    export() {
        let data = {
            condition: this._condition.export(),
            limit    : this._limit,
            score    : this._score,
            sort     : []
        };

        for(let sort of this._sort) {
            data.sort.push(sort.export());
        }

        return data;
    }

    /**
     *
     * @return {{score: Number, condition: {type: String, conditions: *[], operator: String}, limit: Number, sort: []}}
     */
    import(data) {
        if(data.hasOwnProperty('limit')) this._limit = data.limit;
        if(data.hasOwnProperty('score')) this._score = data.score;

        if(data.hasOwnProperty('sort')) {
            this._sort = [];
            for(let sort of data.sort) {
                this.sortBy(sort.field, sort.ascending);
            }
        }

        if(data.hasOwnProperty('condition')) {
            this._condition = this._makeCondition(data.condition.operator);
            this._builder = new ConditionBuilder(this._condition);

            this._importConditions(this._builder, data.condition.conditions);
        }
    }

    /**
     *
     * @param {ConditionBuilder} builder
     * @param {Object[]} conditions
     * @private
     */
    _importConditions(builder, conditions) {
        for(let condition of conditions) {
            if(condition.type === 'field') {
                builder.where(condition.field)[condition.operator](condition.value);
            } else {
                builder[condition.operator]((condBuilder) => {
                    this._importConditions(condBuilder, condition.conditions);
                });
            }
        }
    }


    /**
     *
     * @param {AbstractModel} a
     * @param {AbstractModel} b
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

    /**
     *
     * @param type
     * @return {OrCondition|XorCondition|AndCondition}
     * @private
     */
    _makeCondition(type) {
        if(type === 'or') {
            return new OrCondition();
        } else if(type === 'xor') {
            return new XorCondition();
        } else {
            return new AndCondition();
        }
    }
}