import AbstractField from '@js/Search/Query/Field/AbstractField';

export default class FieldSmaller extends AbstractField {

    /**
     * @inheritDoc
     */
    evaluate(item) {
        let values = item.getField(this._name);

        if(values === null) return this.NO_MATCH_RESULT;

        let search = this._value;
        if(typeof search === 'string' && this._name !== 'password') {
            search = this._value.toLowerCase();
        }

        for(let value of values) {
            if(value < search) return this._createResult(1, 1);
        }

        return this.NO_MATCH_RESULT;
    }
}