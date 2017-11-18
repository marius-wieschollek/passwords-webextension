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
    _createRequest(path, data = null, method = 'GET', dataType = 'json') {
        let headers = new Headers();
        for (let header in this._headers) {
            if (!this._headers.hasOwnProperty(header)) continue;
            headers.append(header, this._headers[header]);
        }
        headers.append('Accept', 'application/' + dataType + ', text/plain, */*');

        let request = new Request(
            this._endpoint + this._paths[path],
            {
                method : data ? POST:method,
                headers: headers
            }
        );
        if (data) request.body = JSON.stringify(data);

        return new Promise((resolve, reject) => {
            fetch(request)
                .then((response) => {
                    if (!response.ok) {
                        if (this._debug) console.error('Request failed', request, response);
                        reject(response)
                    }
                    response.json()
                        .then((d) => {resolve(d);})
                        .catch((response) => {
                            if (this._debug) console.error('Encoding response failed', request, response);
                            reject(response)
                        })
                })
                .catch((response) => {
                    if (this._debug) console.error('Request failed', request, response);
                    reject(response)
                });
        });
    }
}