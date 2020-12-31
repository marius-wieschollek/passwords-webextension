import SearchQuery from '@js/Search/Query/SearchQuery';
import QueryParser from 'search-query-parser';

export default class TextQuery extends SearchQuery {

    constructor(query, condition = 'and') {
        if(['and', 'or', 'xor'].indexOf(condition) === -1) {
            condition = 'and';
        }

        super(condition);
        this._score = 0.2;
        this._limit = 15;
        this._type = 'password';
        this._conditionType = condition;

        this.query(query);
    }

    /**
     *
     * @param {String} text
     */
    query(text) {
        this._condition = this[this._conditionType]();
        let query = QueryParser.parse(text, {keywords: ['id', 'tag', 'folder', 'favorite', 'host', 'url', 'server'], tokenize: true});

        for(let key in query) {
            if(!query.hasOwnProperty(key) || key === 'offsets' || key === 'exclude') continue;

            if(key === 'text') {
                this._addTextCondition(query);
            } else {
                this._addFieldCondition(query, key);
            }
        }
    }

    /**
     *
     * @param {Object} query
     * @param {String} key
     * @private
     */
    _addFieldCondition(query, key) {
        let value = query[key];

        if(Array.isArray(value)) {
            this.where(
                this.field(key).in(value)
            );
        } else {
            this.where(
                this.field(key).equals(value)
            );
        }
    }

    /**
     *
     * @param {Object} query
     * @private
     */
    _addTextCondition(query) {
        let condition = this.and();

        for(let value of query.text) {
            condition.where(
                this.or(
                    this.field('label').contains(value, 4),
                    this.field('username').contains(value, 2),
                    this.field('text').contains(value)
                )
            );
        }

        this.where(condition);
    }
}