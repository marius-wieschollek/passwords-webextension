import Password from 'passwords-client/src/Model/Password';
import Url from 'url-parse';
import AbstractIndexer from '@js/Search/Indexer/AbstractIndexer';

export default class PasswordIndexer extends AbstractIndexer{

    constructor() {
        super();
        this._textIndexFields = ['label', 'username', 'notes'];
    }

    /**
     *
     * @param {Password} password
     * @return {Object}
     */
    indexItem(password) {
        return this._createIndex(password);
    }

    /**
     *
     * @param {Password} password
     * @private
     */
    _createIndex(password) {
        let index = {
            id    : password.getId(),
            type  : 'password',
            text  : [],
            tag   : [],
            folder: [],
            server: [],
            url   : [],
            host  : [],
            fields: []
        };


        this._indexServer(password, index);
        this._indexTextFields(password, index);

        let url = password.getUrl();
        if(url && url.length !== 0) {
            let value = url.toLowerCase();

            index.url.push(value);
            let model = new Url(value);
            index.host.push(model.host);
        }

        for(let field of ['shared', 'favorite', 'password', 'status', 'statusCode']) {
            index.fields[field] = [password._getProperty(field)];
        }

        let customFields = password.getCustomFields();
        for(let customField of customFields) {
            if(!customField.value || customField.value.length === 0) {
                if(customField.type === 'text' || customField.type === 'email') {
                    let value = customField.value.toLowerCase();
                    let field = customField.label.toLowerCase();

                    index.text.push(value);

                    if(!index.fields.hasOwnProperty(field)) index.fields[field] = [];
                    index.fields[field].push(value);
                }
            }

            if(customField.type === 'url') {
                let value = customField.value.toLowerCase();
                let field = customField.label.toLowerCase();

                index.url.push(value);

                let model = new Url(value);
                index.host.push(model.host);

                if(!index.fields.hasOwnProperty(field)) index.fields[field] = [];
                index.fields[field].push(value);
            }
        }

        return index;
    }
}