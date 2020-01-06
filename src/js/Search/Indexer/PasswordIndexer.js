import Password from 'passwords-client/src/Model/Password';
import Url from 'url-parse';

export default class PasswordIndexer {

    constructor() {
        this._index = [];
        this._objects = {};
        this._textIndexFields = ['label', 'username', 'notes'];
    }

    /**
     *
     * @param {string} type
     * @returns {boolean}
     */
    hasType(type) {
        return type === 'password';
    }

    /**
     *
     * @param {Object} item
     * @returns {boolean}
     */
    handlesItem(item) {
        return item instanceof Password;
    }

    getObject(id) {
        return this._objects[id];
    }

    getItems() {
        return this._index;
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
     */
    addItem(password) {
        let func = password._setProperty;

        password._setProperty = (property, value) => {
            let result = func(property, value);

            let index = this._createIndex(password);
            this._index.push(index);

            return result;
        };

        let index = this._createIndex(password);

        this._objects[password.getId()] = password;
        this._index.push(index);
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

        for(let field of this._textIndexFields) {
            let value = password._getProperty(field).toLowerCase();

            if(value.length !== 0) {
                index.text.push(value);
                index.fields[field] = [value];
            }
        }

        let url = password.getUrl();
        if(url && url.length !== 0) {
            let value = url.toLowerCase();

            index.url.push(value);
            let model = new Url(value);
            index.host.push(model.host);
        }

        let server = password.getServer();
        index.server.push(server.getId());
        index.server.push(server.getLabel());

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