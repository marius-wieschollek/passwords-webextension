export default class AbstractIndexer {

    constructor() {
        this._textIndexFields = ['label'];
        this._genericIndexFields = ['favorite', 'hidden'];
    }

    /**
     *
     * @param {(Password|Folder|Tag)} model
     * @param {IndexEntry} index
     * @protected
     */
    _indexServer(model, index) {
        let server = model.getServer();
        index.addFieldValue('server', server.getId())
             .addFieldValue('server', server.getLabel());
    }

    /**
     *
     * @param {(Password|Folder|Tag)} model
     * @param {IndexEntry} index
     * @protected
     */
    _indexTextFields(model, index) {
        for(let field of this._textIndexFields) {
            let value = model.getProperty(field);
            if(value === undefined) return;

            value = value.toLowerCase();
            if(value.length !== 0) {
                index.addFieldValue('text', value)
                     .addFieldValue(field, value);
            }
        }
    }

    /**
     *
     * @param {(Password|Folder|Tag)} model
     * @param {IndexEntry} index
     * @protected
     */
    _indexFields(model, index) {
        for(let field of this._genericIndexFields) {
            index.addFieldValue(field, model.getProperty(field));
        }
    }
}