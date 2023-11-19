import AbstractField from '@js/Search/Query/Field/AbstractField';

export default class FieldMatches extends AbstractField {

    /**
     * @inheritDoc
     */
    evaluate(item) {
        let values = item.getField(this._name);

        if(values === null) return this.NO_MATCH_RESULT;

        let regexp = new RegExp(this._value, 'g');
        for(let value of values) {
            let result = regexp.exec(value);
            if(result.length > 1) return this._createResult(1, 1);
        }

        return this.NO_MATCH_RESULT;
    }
}