import PasswordIndexer from '@js/Search/Indexer/PasswordIndexer';
import Password from 'passwords-client/src/Model/Password';

class SearchIndex {

    constructor() {
        this._indexers = {
            password: new PasswordIndexer()
        };
        this._indexes = {
            password: []
        };
        this._items = {};
    }

    /**
     *
     * @param {(string|string[]|null)} [indexes=[]]
     * @return {Object[]}
     */
    getIndexItems(indexes) {
        if(!Array.isArray(indexes)) {
            if(!indexes) {
                indexes = Object.keys(this._indexes);
            } else {
                indexes = [indexes];
            }
        }

        let items = [];
        for(let index of indexes) {
            items.push(...this._indexes[index]);
        }

        return items;
    }

    getItems(ids) {
        if(!Array.isArray(ids)) ids = [ids];

        let items = [];
        for(let id of ids) {
            if(this._items.hasOwnProperty(id)) {
                items.push(this._items[id]);
            }
        }

        return items;
    }

    /**
     *
     * @param id
     * @returns {null|Password}
     */
    getItem(id) {
        if(this._items.hasOwnProperty(id)) {
            return this._items[id];
        }

        return null;
    }

    /**
     *
     * @param {Array} items
     */
    addItems(items) {
        if(!Array.isArray(items)) items = [items];

        for(let item of items) {
            this.addItem(item);
        }
    }

    addItem(item) {
        let type = this._getItemType(item);

        let index = this._indexers[type].indexItem(item);
        this._indexes[type].push(index);
        this._items[item.getId()] = item;
    }

    _getItemType(item) {
        if(item instanceof Password) {
            return 'password';
        }
    }
}

export default new SearchIndex();