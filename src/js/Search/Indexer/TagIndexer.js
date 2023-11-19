import AbstractIndexer from '@js/Search/Indexer/AbstractIndexer';
import IndexEntry from "@js/Models/Search/IndexEntry";

export default class TagIndexer extends AbstractIndexer {

    /**
     *
     * @param {Tag} tag
     * @return {IndexEntry}
     */
    indexItem(tag) {
        return this._createIndex(tag);
    }

    /**
     *
     * @param {Tag} tag
     * @return {IndexEntry}
     */
    _createIndex(tag) {
        let entry = new IndexEntry(tag.getId(), 'tag', tag.isHidden());

        this._indexServer(tag, entry);
        this._indexTextFields(tag, entry);
        this._indexFields(tag, entry);

        entry.clean();

        return entry;
    }
}