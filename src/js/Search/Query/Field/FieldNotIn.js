import AbstractField from '@js/Search/Query/Field/AbstractField';

export default class FieldNotIn extends AbstractField {

    /**
     * @inheritDoc
     */
    evaluate(item) {
        let values = item.getField(this._name);

        if(values === null) return this._createResult(1, 1);

        for(let value of values) {
            if(this._value.indexOf(value) !== -1) {
                return this.NO_MATCH_RESULT;
            }
        }

        return this._createResult(1, 1);
    }
}