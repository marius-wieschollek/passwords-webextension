import ErrorManager from "@js/Manager/ErrorManager";

export default class IndexEntry {

    /**
     *
     * @param {String} id
     * @param {String} type
     * @param {Boolean} hidden
     * @param {Object} fields
     * @param {Object} boosts
     */
    constructor(id, type, hidden, fields = {}, boosts = {}) {
        this._id = id;
        this._type = type;
        this._hidden = hidden;
        this._fields = fields;
        this._boosts = boosts;
    }

    getId() {
        return this._id;
    }

    getType() {
        return this._type;
    }

    isHidden() {
        return this._hidden;
    }

    /**
     *
     * @param {String} name
     * @param {*[]} value
     * @return {IndexEntry}
     */
    setField(name, value) {
        if (!Array.isArray(value)) {
            value = [value];
        }

        this._fields[name] = value;

        return this;
    }

    /**
     *
     * @param {String} name
     * @param value
     * @return {IndexEntry}
     */
    addFieldValue(name, value) {
        if(value === undefined) {
            ErrorManager.warning('Can not index "undefined" as "' + name + '"');
            return this;
        }

        if (!this._fields.hasOwnProperty(name)) {
            this._fields[name] = [];
        }

        this._fields[name].push(value);

        return this;
    }

    /**
     *
     * @param {String} name
     * @return {null|*[]}
     */
    getField(name) {
        if (name === 'id' || name === 'type' || name === 'hidden') {
            return [this[`_${name}`]];
        }

        if (this._fields.hasOwnProperty(name)) {
            return this._fields[name];
        }

        return null;
    }

    getFields() {
        return ['id', 'type', 'hidden', ...Object.keys(this._fields)].reduce(
            (data, field) => {
                data[field] = this.getField(field);
                return data;
            },
            {}
        );
    }

    /**
     *
     * @param {String} name
     * @param {Number} value
     *
     * @return IndexEntry
     */
    setBoost(name, value) {
        this._boosts[name] = value;

        return this;
    }

    /**
     *
     * @param {String} name
     * @returns {Number}
     */
    getBoost(name) {
        if (this._boosts.hasOwnProperty(name)) {
            return this._boosts[name];
        }

        return 0;
    }

    clean() {
        for (let field in this._fields) {
            this._fields[field] = [...new Set(this._fields[field])];
        }
    }
}