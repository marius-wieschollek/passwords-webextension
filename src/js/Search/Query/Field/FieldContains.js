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
            // @TODO count all occurrences
            if(value.indexOf(search) !== -1) return matches + 1;
            return matches;
        }, 0);

        return this._createResult(values.length, matches);
    }
}