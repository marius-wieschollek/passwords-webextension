import AbstractController from '@js/Controller/AbstractController';
import TabManager from "@js/Manager/TabManager";
import QueryParser from "search-query-parser";
import SearchService from "@js/Services/SearchService";

export default class Search extends AbstractController {

    /**
     *
     * @param {Message} message
     * @param {Message} reply
     */
    async execute(message, reply) {
        let input = message.getPayload().query,
            query = this._createQuery(input);


        reply.setType('password.items')
             .setPayload(query.execute());
    }

    _createQuery(searchText) {
        let tokens = QueryParser.parse(searchText, {keywords: ['id', 'tag', 'folder', 'favorite', 'host', 'url', 'server'], tokenize: true}),
            query  = SearchService.find('password')
                                  .paginate('limit', 16)
                                  .boost('multiply', 'favorite', 2.0);

        if(TabManager.get().tab.incognito) {
            query.withHidden(true);
        }

        for(let key in tokens) {
            if(!tokens.hasOwnProperty(key) || key === 'offsets' || key === 'exclude') continue;

            if(key === 'text') {
                this._addTextCondition(query, tokens);
            } else {
                this._addFieldCondition(query, tokens, key);
            }
        }

        return query;
    }

    /**
     *
     * @param {QueryBuilder} query
     * @param {Object} tokens
     * @param {String} key
     * @private
     */
    _addFieldCondition(query, tokens, key) {
        let value = tokens[key];

        if(Array.isArray(value)) {
            query.where(key, 'in', value);
        } else {
            query.where(key, '=', value);
        }
    }

    /**
     *
     * @param {QueryBuilder} query
     * @param {Object} tokens
     * @private
     */
    _addTextCondition(query, tokens) {
        query.andWhere(
            (qb) => {
                for(let value of tokens.text) {
                    qb.orWhere(
                        [
                            ['label', 'contains', value, 4],
                            ['username', 'contains', value, 2],
                            ['text', 'contains', value]
                        ]
                    );
                }
            }
        );
    }
}