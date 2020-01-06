import QueryParser from 'search-query-parser';
import SearchQuery from '@js/Search/Query/SearchQuery';

export default class Search {

    /**
     *
     * @param {Message} message
     * @param {Message} reply
     */
    async execute(message, reply) {
        let input = message.getPayload().query;
        let query = QueryParser.parse(input, {keywords: ['tag', 'folder', 'host', 'url'], tokenize: true});
        let search = new SearchQuery()
            .type('password')
            .score(0.2);

        for(let key in query) {
            if(!query.hasOwnProperty(key) || key === 'offsets' || key === 'exclude') continue;

            if(key === 'text') {
                this._addTextCondition(search, query);
            } else {
                this._addFieldCondition(query, key, search);
            }
        }

        reply.setType('password.items')
            .setPayload(search.execute());
    }

    _addFieldCondition(query, key, search) {
        let value = query[key];

        if(Array.isArray(value)) {
            search.where(
                search.field(key).in(value)
            );
        } else {
            search.where(
                search.field(key).equals(value)
            );
        }
    }

    _addTextCondition(search, query) {
        let condition = search.and();

        for(let value of query.text) {
            condition.where(
                search.field('text').contains(value)
            );
        }

        search.where(condition);
        return value;
    }
}