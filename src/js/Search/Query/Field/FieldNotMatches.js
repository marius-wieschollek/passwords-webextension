import AbstractField from '@js/Search/Query/Field/AbstractField';

export default class FieldNotMatches extends AbstractField {

    /**
     * @inheritDoc
     */
    evaluate(item) {
        let values = item.getField(this._name);

        if(values === null) return this._createResult(1, 1);

        let regexp = new RegExp(this._value, 'g');
        for(let value of values) {
            let matches = regexp.exec(value);

            if(matches.length > 1) {
                return this.NO_MATCH_RESULT;
            }
        }

        return this._createResult(1, 1);
    }
}