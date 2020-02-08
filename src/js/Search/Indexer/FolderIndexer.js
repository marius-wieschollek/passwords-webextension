import AbstractIndexer from '@js/Search/Indexer/AbstractIndexer';

export default class FolderIndexer extends AbstractIndexer {

    /**
     *
     * @param {Folder} folder
     * @return {Object}
     */
    indexItem(folder) {
        return this._createIndex(folder);
    }

    /**
     *
     * @param {Folder} folder
     * @return {Object}
     */
    _createIndex(folder) {
        let index = {
            id    : folder.getId(),
            type  : 'folder',
            text  : [],
            folder: [],
            server: [],
            fields: []
        };

        this._indexServer(folder, index);
        this._indexTextFields(folder, index);
        this._indexFields(folder, index);

        return index;
    }
}