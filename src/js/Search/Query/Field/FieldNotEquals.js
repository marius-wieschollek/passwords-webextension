import AbstractField from '@js/Search/Query/Field/AbstractField';

export default class FieldNotEquals extends AbstractField {

    /**
     * @inheritDoc
     */
    evaluate(item) {
        let values = item.getField(this._name);

        if(values === null) return this._createResult(1, 1);

        let search = this._value.toLowerCase();
        for(let value of values) {
            if(value === search) return this.NO_MATCH_RESULT;
        }

        return this._createResult(1, 1);
    }
}