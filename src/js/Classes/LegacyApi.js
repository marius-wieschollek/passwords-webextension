import Utility from "@js/Classes/Utility";

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
        this._debug = debug;

        this.login(endpoint, user, password);
    }

    login(endpoint, user = null, password = null) {
        this._endpoint = endpoint + '/index.php/apps/passwords/api/0.1/passwords';

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
        return this._createRequest();
    }

    /**
     * Saves a new password
     *
     * @param data
     * @returns {Promise}
     */
    createPassword(data = {}) {
        return this._createRequest(data);
    }

    /**
     * Updates a password
     *
     * @param data
     * @returns {Promise}
     */
    updatePassword(data = {}) {
        return this._createRequest(data, '/' + data.id, 'PUT');
    }


    /**
     * Internal
     */

    /**
     * Creates an api request
     *
     * @param data
     * @param path
     * @param method
     * @param dataType
     * @returns {Promise}
     * @private
     */
    _createRequest(data = null, path = '', method = 'GET', dataType = 'json') {
        let headers = new Headers();
        for (let header in this._headers) {
            if (!this._headers.hasOwnProperty(header)) continue;
            headers.append(header, this._headers[header]);
        }
        headers.append('Accept', 'application/' + dataType + ', text/plain, */*');

        if (data && method === 'GET') method = 'POST';
        let options = {method, headers, credentials: 'omit'};
        if (data) options.body = JSON.stringify(data);
        let request = new Request(
            this._endpoint + path,
            options
        );

        return new Promise((resolve, reject) => {
            fetch(request)
                .then((response) => {
                    if (!response.ok) {
                        if (this._debug) console.error('Request failed', request, response);
                        LegacyApi.handleHttpErrors(response, reject);
                    }
                    response.json()
                        .then((d) => {resolve(d);})
                        .catch((error) => {
                            if (this._debug) console.error('Encoding response failed', request, response, error);
                            LegacyApi.handleHttpErrors(response, reject, error);
                        })
                })
                .catch((response) => {
                    if (this._debug) console.error('Request failed', request, response);
                    LegacyApi.handleHttpErrors(response, reject);
                });
        });
    }

    static handleHttpErrors(response, reject, error = null) {
        if(response.status === 200 && error !== null) {
            reject({message: Utility.translate('ApiLogin200')});
        } else if(response.status === 401) {
            reject({message: Utility.translate('ApiLogin401')});
        } else if(response.status === 403) {
            reject({message: Utility.translate('ApiLogin403')});
        } else if(response.status === 404) {
            reject({message: Utility.translate('ApiLogin404')});
        } else if([500, 501, 502, 503, 504].indexOf(response.status) !== -1) {
            reject({message: Utility.translate('ApiLogin500')});
        } else if(response.status && response.statusText) {
            let message = Utility.translate('ApiLoginGeneric', [[response.status.toString(), response.statusText]]);
            reject({message});
        } else {
            reject(response);
        }
    }
}