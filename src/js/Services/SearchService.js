import PasswordIndexer from "@js/Search/Indexer/PasswordIndexer";
import FolderIndexer from "@js/Search/Indexer/FolderIndexer";
import TagIndexer from "@js/Search/Indexer/TagIndexer";
import Index from "@js/Models/Search/Index";
import {emit, subscribe} from "@js/Event/Events";
import QueryBuilder from "@js/Search/Query/Builder/QueryBuilder";
import AndCondition from "@js/Search/Query/Condition/AndCondition";
import OrCondition from "@js/Search/Query/Condition/OrCondition";
import XorCondition from "@js/Search/Query/Condition/XorCondition";
import ErrorManager from "@js/Manager/ErrorManager";

export default new class SearchService {

    constructor() {
        this._items = {};
        this._indexes = {
            password: new Index(new PasswordIndexer()),
            folder  : new Index(new FolderIndexer()),
            tag     : new Index(new TagIndexer())
        };
        subscribe(
            'password:statistics:updated',
            (data) => {
                let item = this.get(data.id);
                if(item) {
                    this.update(item);
                }
            }
        );
    }


    get(id) {
        if(!this._items.hasOwnProperty(id)) return null;

        return this._items[id];
    }

    /**
     * @param {(AbstractModel|AbstractModel[])} items
     */
    add(items) {
        if(!Array.isArray(items)) {
            items = [items];
        }

        items.forEach((item) => {
            this._addItem(item);
        });

        emit('search:items:added', items);
        emit('search:items:changed', {added: items});
    }

    /**
     * @param {(AbstractModel|AbstractModel[])} items
     */
    remove(items) {
        if(!Array.isArray(items)) {
            items = [items];
        }

        items.forEach((item) => {
            this._removeItem(item);
        });

        emit('search:items:removed', items);
        emit('search:items:changed', {removed: items});
    }

    /**
     * @param {(AbstractModel|AbstractModel[])} items
     */
    update(items) {
        if(!Array.isArray(items)) {
            items = [items];
        }

        items.forEach((item) => {
            this._updateItem(item);
        });

        emit('search:items:updated', items);
        emit('search:items:changed', {updated: items});
    }

    /**
     *
     * @param {(String|String[])} types
     * @param {String} type
     * @return {QueryBuilder}
     */
    find(types = null, type = 'and') {
        if(types === null) {
            types = Object.keys(this._indexes);
        }

        let index = null;
        if(Array.isArray(types)) {
            index = types.reduce((index, current) => {
                index.push(...this._indexes[current].getAll());
                return index;
            }, []);
        } else {
            index = this._indexes[types].getAll();
        }

        let condition;
        if(type === 'or') {
            condition = new OrCondition();
        } else if(type === 'xor') {
            condition = new XorCondition();
        } else {
            condition = new AndCondition();
        }

        return new QueryBuilder(condition, index);
    }

    /**
     *
     * @param {AbstractModel} item
     * @private
     */
    _addItem(item) {
        if(this._indexes.hasOwnProperty(item.MODEL_TYPE)) {
            this._indexes[item.MODEL_TYPE].add(item);
            this._items[item.getId()] = item;
        } else {
            ErrorManager.error('Unknown item can not be indexed', {item});
        }
    }

    /**
     *
     * @param item
     * @private
     */
    _removeItem(item) {
        let id = item.getId();
        if(!this._items.hasOwnProperty(id)) return;
        this._indexes[item.MODEL_TYPE].remove(id);
        delete this._items[id];
    }

    /**
     *
     * @param item
     * @private
     */
    _updateItem(item) {
        let id = item.getId();
        if(!this._items.hasOwnProperty(id)) {
            this._addItem(item);
            return;
        }
        this._indexes[item.MODEL_TYPE].update(item);
        this._items[id] = item;
    }
};