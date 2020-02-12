import Url from 'url-parse';
import AbstractIndexer from '@js/Search/Indexer/AbstractIndexer';

export default class PasswordIndexer extends AbstractIndexer {

    constructor() {
        super();
        this._textIndexFields = ['label', 'username', 'notes'];
        this._genericIndexFields = ['shared', 'favorite', 'hidden', 'password', 'status', 'statusCode'];
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
            id      : password.getId(),
            type    : 'password',
            text    : [],
            tag     : [],
            folder  : [],
            server  : [],
            password: [],
            url     : [],
            host    : [],
            fields  : []
        };

        this._indexServer(password, index);
        this._indexTextFields(password, index);
        this._indexFields(password, index);

        let url = password.getUrl();
        if(url && url.length !== 0) {
            let value = url.toLowerCase();

            index.url.push(value);
            let model = new Url(value);
            index.host.push(model.host);
        }

        let value = password.getPassword();
        if(value && value.length !== 0) {
            index.password.push(value);
        }

        value = password.getFolder();
        if(value && value.length !== 0) {
            index.folder.push(value);
        }

        let customFields = password.getCustomFields();
        for(let customField of customFields) {
            if(!customField.getValue() || customField.getValue().length === 0) continue;

            if(customField.getType() === 'text' || customField.getType() === 'email') {
                let value = customField.getValue().toLowerCase(),
                    field = customField.getLabel().toLowerCase();

                index.text.push(value);

                if(!index.fields.hasOwnProperty(field)) index.fields[field] = [];
                index.fields[field].push(value);
            } else if(customField.getType() === 'url') {
                let value = customField.getValue().toLowerCase(),
                    field = customField.getLabel().toLowerCase();

                index.url.push(value);

                let model = new Url(value);
                index.host.push(model.host);

                if(!index.fields.hasOwnProperty(field)) index.fields[field] = [];
                index.fields[field].push(value);
            } else if(customField.getType() === 'secret') {
                let value = customField.getValue(),
                    field = customField.getLabel().toLowerCase();

                index.password.push(value);
                if(!index.fields.hasOwnProperty(field)) index.fields[field] = [];
                index.fields[field].push(value);
            }
        }

        return index;
    }
}