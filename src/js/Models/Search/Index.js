import ErrorManager from "@js/Manager/ErrorManager";

export default class Index {

    constructor(indexer) {
        this._indexer = indexer;
        this._index = [];
    }

    getAll() {
        return this._index;
    }

    /**
     *
     * @param {AbstractRevisionModel} item
     */
    add(item) {
        try {
            let index = this._indexer.indexItem(item);
            this._index.push(index);
        } catch(e) {
            ErrorManager.logError(e);
        }
    }

    /**
     *
     * @param {String} id
     */
    remove(id) {
        let index = this._index.findIndex((element) => element.getId() === id);
        if(index !== -1) {
            this._index.splice(index, 1);
        }
    }
}