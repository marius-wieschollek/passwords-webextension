import $ from "jquery";

export default class LegacyApi {

    get headers() {
        return this._headers;
    }

    get endpoint() {
        return this._endpoint;
    }

    get debug() {
        return this._debug;
    }

    constructor(endpoint, user = null, password = null, token = null, debug = false) {
        this._debug = false;

        this._paths = {
            'password.list': 'passwords',
        };

        this.login(endpoint, user, password);
    }

    login(endpoint, user = null, password = null) {
        this._endpoint = endpoint + '/index.php/apps/passwords/api/0.1/';

        this._headers = {};
        if (user !== null && password !== null) {
            this._headers['Authorization'] = 'Basic ' + btoa(user + ':' + password);
            this._headers['Content-Type'] = 'application/json';
        }
    }

    /**
     * Gets all the passwords, excluding those hidden or in trash
     *
     * @returns {Promise}
     */
    listPasswords() {
        return this._createRequest('password.list');
    }


    /**
     * Internal
     */

    /**
     * Creates an api request
     *
     * @param path
     * @param data
     * @param method
     * @param dataType
     * @returns {Promise}
     * @private
     */
    _createRequest(path, data = null, method = null, dataType = 'json') {

        if (method === null) {
            method = data === null ? 'GET':'POST';
        }

        return new Promise((resolve, reject) => {
            $.ajax({
                       type    : method,
                       dataType: dataType,
                       headers : this._headers,
                       url     : this._endpoint + this._paths[path],
                       data    : data,
                       success : (data) => { resolve(data); },
                       error   : (data) => {
                           try {
                               let response = JSON.parse(data.responseText);
                               data.message = response.message;
                           } catch (e) {
                               data.message = data.status + ': ' + data.statusText;
                           }
                           if (this._debug) console.error(data);
                           reject(data);
                       }
                   });
        });
    }
}