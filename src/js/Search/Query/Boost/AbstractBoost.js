export default class AbstractBoost {


    constructor(name, amount = null) {
        this._name = name;
        this._amount = amount;
    }

    /**
     * @param {IndexEntry} entry
     * @param {Number} score
     * @return {Number}
     */
    boost(entry, score) {
        return score;
    }
}