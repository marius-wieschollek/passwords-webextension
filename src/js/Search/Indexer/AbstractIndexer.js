export default class AbstractIndexer {

    constructor() {
        this._textIndexFields = ['label'];
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
            let value = model._getProperty(field).toLowerCase();

            if(value.length !== 0) {
                index.text.push(value);
                index.fields[field] = [value];
            }
        }
    }
}