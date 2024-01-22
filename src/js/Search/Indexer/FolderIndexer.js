import AbstractIndexer from '@js/Search/Indexer/AbstractIndexer';
import IndexEntry from "@js/Models/Search/IndexEntry";

export default class FolderIndexer extends AbstractIndexer {

    /**
     *
     * @param {Folder} folder
     * @return {IndexEntry}
     */
    indexItem(folder) {
        return this._createIndex(folder);
    }

    /**
     *
     * @param {Folder} folder
     * @return {IndexEntry}
     */
    _createIndex(folder) {
        let entry = new IndexEntry(folder.getId(), 'folder', folder.isHidden());
        this._indexServer(folder, entry);
        this._indexTextFields(folder, entry);
        this._indexFields(folder, entry);

        entry.addFieldValue('folder', folder.getId())
             .addFieldValue('folder', folder.getLabel());

        let value = folder.getParent();
        if(value && value.length !== 0) {
            entry.addFieldValue('parent', value);
        }

        entry.clean();

        return entry;
    }
}