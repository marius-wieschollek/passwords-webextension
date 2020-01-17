import AbstractField from '@js/Search/Query/Field/AbstractField';

export default class FieldNotMatches extends AbstractField {

    /**
     * @inheritDoc
     */
    evaluate(item) {
        let values = this._getFieldValues(item);

        if(!values) return {matches: 1, checks: 1, passed: true};

        let regexp = new RegExp(this._value, 'g');
        for(let value of values) {
            let matches = regexp.exec(value);

            if(matches.length > 1) {
                return {passed: false};
            }
        }

        return {matches: 1, checks: 1, passed: true};
    }
}