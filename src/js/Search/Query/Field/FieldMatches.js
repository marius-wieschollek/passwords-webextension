import AbstractField from '@js/Search/Query/Field/AbstractField';

export default class FieldMatches extends AbstractField {

    evaluate(item) {
        let values = this._getFieldValues(item);

        if(!values) return {passed: false};

        let regexp = new RegExp(this._value, 'g');
        for(let value of values) {
            let matches = regexp.exec(value);

            if(matches.length > 1) {
                return {matches: 1, checks: 1, passed: true};
            }
        }

        return {passed: false};
    }
}