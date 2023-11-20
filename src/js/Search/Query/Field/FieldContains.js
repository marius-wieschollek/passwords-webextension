import AbstractField from '@js/Search/Query/Field/AbstractField';

export default class FieldContains extends AbstractField {

    /**
     * @inheritDoc
     */
    evaluate(item) {
        let values = item.getField(this._name);

        if(values === null) return this.NO_MATCH_RESULT;

        let search = this._value.toLowerCase();

        let matches = values.reduce((matches, value) => {
            return matches + this._countOccurrencesInString(value, search);
        }, 0);

        return this._createResult(values.length, matches);
    }

    _countOccurrencesInString(string, search) {
        if(search.length > string.length || search.length === 0) return 0;

        let matches  = 0,
            position = 0;

        while(true) {
            position = string.indexOf(search, position);
            if(position >= 0) {
                matches++;
                position += search.length;
            } else {
                break;
            }
        }

        return matches;
    }
}