import AbstractField from '@js/Search/Query/Field/AbstractField';

export default class FieldIn extends AbstractField {

    /**
     * @inheritDoc
     */
    evaluate(item) {
        let values = item.getField(this._name);

        if(values === null) return this.NO_MATCH_RESULT;

        for(let value of values) {
            if(this._value.indexOf(value) !== -1) {
                return this._createResult(1, 1);
            }
        }

        return this.NO_MATCH_RESULT;
    }
}