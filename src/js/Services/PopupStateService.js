import MessageService from "@js/Services/MessageService";
import ErrorManager   from "@js/Manager/ErrorManager";
import {emit} from "@js/Event/Events";

export default new class PopupStateService {

    constructor() {
        this._tab = 'related';
        this._data = {};
        this._status = {};

        this._defaults = {
            'search.query': ''
        };
        this._payload = null;
    }

    async init() {
        let reply  = await MessageService.send('popup.status.get'),
            status = reply.getPayload();

        this._tab = status.tab;
        this._status = status.status;
        this._data = status.data;
        this._payload = status;
    }

    /**
     * @deprecated
     * @returns {*}
     */
    getPayload() {
        return this._payload;
    }

    /**
     * @returns {String}
     */
    getTab() {
        return this._tab;
    }

    /**
     * @param {String} tab
     */
    setTab(tab) {
        this._tab = tab;
        this._saveState();
    }

    /**
     * @param {String} item
     * @returns {*}
     */
    getStatus(item) {
        return this._status.hasOwnProperty(item) ? this._status[item]:null;
    }

    /**
     * @param {String} key
     * @param {*} value
     */
    setStatus(key, value) {
        this._status[key] = [value];
        emit('popup.status',{key, value});
    }

    /**
     * @param {(String|String[])} key
     * @param {(String|null)} [tab=null]
     * @returns {*}
     */
    get(key, tab = null) {
        if(typeof key !== 'string') {
            let data = {};
            for(let value of key) {
                data[value] = this._getValue(value, tab);
            }

            return data;
        }
        return this._getValue(key, tab);
    }

    /**
     * @param {(String|Object)} key The key of the value to set or an object with the keys and values to set
     * @param {*} [value] The value or the tab of the key is an object
     * @param {(String|null)} [tab=null]
     * @returns void
     */
    set(key, value, tab = null) {
        if(typeof key !== 'string') {
            this._setValues(key, value === undefined ? null:value);
        } else {
            this._setValue(key, value, tab);
        }

        this._saveState();
    }

    /**
     *
     * @param key
     * @param tab
     * @returns {null|*}
     * @private
     */
    _getValue(key, tab = null) {
        if(tab === null) tab = this._tab;
        if(!this._data.hasOwnProperty(tab) || !this._data[tab].hasOwnProperty(key)) {
            let defaultKey = `${tab}.${key}`;
            if(this._defaults.hasOwnProperty(defaultKey)) {
                return this._defaults[defaultKey];
            }

            return null;
        }

        return this._data[tab][key];
    }

    /**
     *
     * @param data
     * @param tab
     * @private
     */
    _setValues(data, tab = null) {
        for(let key in data) {
            if(data.hasOwnProperty(key)) this._setValue(key, data[key], tab);
        }
    }

    /**
     *
     * @param key
     * @param value
     * @param tab
     * @returns {{}}
     * @private
     */
    _setValue(key, value, tab = null) {
        if(tab === null) tab = this._tab;
        if(!this._data.hasOwnProperty(tab)) this._data[tab] = {};
        this._data[tab][key] = value;
        emit('popup.data', {tab, key, value})
    }

    /**
     *
     * @private
     */
    _saveState() {
        let message = {
            type   : 'popup.status.set',
            payload: {
                service: true,
                tab    : this._tab,
                data   : this._data
            }
        };

        MessageService
            .send(message)
            .catch(ErrorManager.catch);
    }
};