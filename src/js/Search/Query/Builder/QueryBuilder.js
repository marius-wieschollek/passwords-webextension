import AndCondition from "@js/Search/Query/Condition/AndCondition";
import FieldEquals from "@js/Search/Query/Field/FieldEquals";
import FieldNotEquals from "@js/Search/Query/Field/FieldNotEquals";
import FieldContains from "@js/Search/Query/Field/FieldContains";
import FieldNotContains from "@js/Search/Query/Field/FieldNotContains";
import FieldIn from "@js/Search/Query/Field/FieldIn";
import FieldNotIn from "@js/Search/Query/Field/FieldNotIn";
import FieldStartsWith from "@js/Search/Query/Field/FieldStartsWith";
import OrCondition from "@js/Search/Query/Condition/OrCondition";
import XorCondition from "@js/Search/Query/Condition/XorCondition";
import SortAscending from "@js/Search/Query/Sort/SortAscending";
import SortDescending from "@js/Search/Query/Sort/SortDescending";
import {ObjectMerger} from "passwords-client/utility";
import Limit from "@js/Search/Query/Pagination/Limit";
import Pagination from "@js/Search/Query/Pagination/Pagination";
import MultiplyBoost from "@js/Search/Query/Boost/MultiplyBoost";
import SearchService from "@js/Services/SearchService";
import FieldGreater from "@js/Search/Query/Field/FieldGreater";
import FieldSmaller from "@js/Search/Query/Field/FieldSmaller";
import CustomSort from "@js/Search/Query/Sort/CustomSort";
import FieldSmallerOrEquals from "@js/Search/Query/Field/FieldSmallerOrEquals";
import FieldGreaterOrEquals from "@js/Search/Query/Field/FieldGreaterOrEquals";
import Match from "@js/Models/Search/Match";

export default class QueryBuilder {

    constructor(condition, index = []) {
        if(condition) {
            this._condition = condition;
        } else {
            this._condition = new AndCondition();
        }

        this._sorts = [];
        this._boosts = [];
        this._pagination = null;
        this._hidden = false;
        this._index = index;
        this._having = new AndCondition();
        this._transform = null;
    }

    where(field, operator = undefined, value = undefined, weight = 1.0) {
        if(Array.isArray(field)) {
            field.forEach(
                (data) => {
                    this.where(...data);
                }
            );
            return this;
        }

        if(value === undefined && operator !== undefined) {
            value = operator;
            operator = '=';
        }

        let condition = this._createField(field, operator, value, weight);
        this._condition.append(condition);

        return this;
    }

    andWhere(fields) {
        let condition = new AndCondition();
        this._createCondition(fields, condition);
        return this;
    }

    orWhere(fields) {
        let condition = new OrCondition();
        this._createCondition(fields, condition);
        return this;
    }

    xOrWhere(fields) {
        let condition = new XorCondition();
        this._createCondition(fields, condition);
        return this;
    }

    having(field, operator = undefined, value = undefined) {
        if(Array.isArray(field)) {
            field.forEach(
                (data) => {
                    this.having(...data);
                }
            );
            return this;
        }

        if(value === undefined && operator !== undefined) {
            value = operator;
            operator = '=';
        }

        let condition = this._createField(field, operator, value);
        this._having.append(condition);

        return this;
    }

    andHaving(fields) {
        let condition = new AndCondition();
        this._createCondition(fields, condition, true);
        return this;
    }

    orHaving(fields) {
        let condition = new OrCondition();
        this._createCondition(fields, condition, true);
        return this;
    }

    xOrHaving(fields) {
        let condition = new XorCondition();
        this._createCondition(fields, condition, true);
        return this;
    }

    sortBy(field, ascending) {
        if(field === 'custom') {
            this._sorts.push(new CustomSort(field));
            return this;
        }
        if(ascending) {
            this._sorts.push(new SortAscending(field));
        } else {
            this._sorts.push(new SortDescending(field));
        }
        return this;
    }

    paginate(type, ...properties) {
        if(type === 'limit') {
            this._pagination = new Limit(...properties);
        } else {
            this._pagination = new Pagination(...properties);
        }
        return this;
    }

    boost(method, name, amount = null) {
        this._boosts.push(new MultiplyBoost(name, amount));
        return this;
    }

    withHidden(value) {
        this._hidden = value;
        return this;
    }

    /**
     *
     * @param {(Function|null)} callback
     * @return {QueryBuilder}
     */
    transform(callback) {
        this._transform = callback;
        return this;
    }

    /**
     * @return {AbstractModel[]}
     */
    execute() {
        let matches = this._index.reduce((matches, item) => {
            if(!this._hidden && item.isHidden()) {
                return matches;
            }

            let conditionResult = this._condition.evaluate(item);

            if(conditionResult.passed) {
                let score = conditionResult.matches / conditionResult.checks;
                score = this._applyBoosts(item, score);

                let match        = new Match(item, score),
                    havingResult = this._having.evaluate(match);

                if(havingResult.passed) {
                    matches.push(match);
                }
            }

            return matches;
        }, []);

        matches = this._sortResults(matches);
        matches = this._applyResultLimits(matches);

        let results = matches.map(
            (match) => {
                return SearchService.get(match.getId());
            }
        );

        return this._transformResults(results);
    }

    _applyResultLimits(matches) {
        if(this._pagination === null) {
            return matches;
        }

        return this._pagination.apply(matches);
    }

    /**
     *
     * @param {Array} matches
     * @return {Array}
     * @private
     */
    _sortResults(matches) {
        if(this._sorts.length === 0) {
            this.sortBy('score');
        }

        return matches.sort(
            (a, b) => {
                for(let sort of this._sorts) {
                    let result = sort.compare(a, b);
                    if(result !== 0) return result;
                }

                return 0;
            }
        );
    }

    _createField(field, operator, value, weight) {
        switch(operator) {
            default:
            case '=':
            case 'equals':
                return new FieldEquals(field, value, weight);
            case '!=':
            case 'not-equals':
                return new FieldNotEquals(field, value, weight);
            case '>':
            case 'greater':
                return new FieldGreater(field, value, weight);
            case '>=':
            case 'greater-equals':
                return new FieldGreaterOrEquals(field, value, weight);
            case '<':
            case 'smaller':
                return new FieldSmaller(field, value, weight);
            case '<=':
            case 'smaller-equals':
                return new FieldSmallerOrEquals(field, value, weight);
            case 'contains':
                return new FieldContains(field, value, weight);
            case 'not-contains':
                return new FieldNotContains(field, value, weight);
            case 'in':
                return new FieldIn(field, value, weight);
            case 'not-in':
                return new FieldNotIn(field, value, weight);
            case 'starts-with':
                return new FieldStartsWith(field, value, weight);
        }
    }

    _createCondition(fields, condition, having = false) {
        if(Array.isArray(fields)) {
            let array = this._createFieldsFromArray(fields);
            condition.append(...array);
        } else {
            let builder = new QueryBuilder(condition);
            fields(builder);
        }

        if(having) {
            this._having.append(condition);
        } else {
            this._condition.append(condition);
        }
    }

    _createFieldsFromArray(fields) {
        return fields.map(
            (field) => {
                return this._createField(...field);
            }
        );
    }

    _applyBoosts(item, score) {
        for(let boost of this._boosts) {
            score = boost.boost(item, score);
        }

        return score;
    }

    _transformResults(results) {
        return this._transform !== null ? this._transform(results):results;
    }
}