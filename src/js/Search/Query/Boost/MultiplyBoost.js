import AbstractBoost from "@js/Search/Query/Boost/AbstractBoost";

export default class MultiplyBoost extends AbstractBoost {


    boost(entry, score) {
        let boost = entry.getBoost(this._name);
        if(boost === 0) {
            return score;
        }
        return score * (this._amount === null ? boost:this._amount);
    }
}