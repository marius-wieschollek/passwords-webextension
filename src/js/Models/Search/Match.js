export default class Match {

    /**
     *
     * @param {IndexEntry} indexEntry
     * @param {Number} score
     */
    constructor(indexEntry, score) {
        this._indexEntry = indexEntry;
        this._score = score;
    }


    getId() {
        return this._indexEntry.getId();
    }

    getType() {
        return this._indexEntry.getType();
    }

    isHidden() {
        return this._indexEntry.isHidden();
    }

    /**
     *
     * @param {String} name
     * @return {null|*[]}
     */
    getField(name) {
        if (name === 'score') {
            return [this._score];
        }

        return this._indexEntry.getField(name);
    }

    getFields() {
        let fields = this._indexEntry.getFields();
        fields.score = [this._score];

        return fields;
    }

    /**
     *
     * @param {String} name
     * @returns {Number}
     */
    getBoost(name) {
        return this._indexEntry.getBoost(name);
    }
}