export default class AbstractIndexer {

    constructor() {
        this._textIndexFields = ['label'];
        this._genericIndexFields = ['favorite', 'hidden'];
    }

    /**
     *
     * @param {(Password|Folder|Tag)} model
     * @param {Object} index
     * @protected
     */
    _indexServer(model, index) {
        let server = model.getServer();
        index.server.push(server.getId());
        index.server.push(server.getLabel());
    }

    /**
     *
     * @param {(Password|Folder|Tag)} model
     * @param {Object} index
     * @protected
     */
    _indexTextFields(model, index) {
        for(let field of this._textIndexFields) {
            let value = model.getProperty(field);
            if(value === undefined) return;

            value = value.toLowerCase();
            if(value.length !== 0) {
                index.text.push(value);
                index.fields[field] = [value];
            }
        }
    }

    /**
     *
     * @param {(Password|Folder|Tag)} model
     * @param {Object} index
     * @protected
     */
    _indexFields(model, index) {
        for(let field of this._genericIndexFields) {
            index.fields[field] = [model.getProperty(field)];
        }
    }
}