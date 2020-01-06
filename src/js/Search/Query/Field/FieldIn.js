import AbstractField from '@js/Search/Query/Field/AbstractField';

export default class FieldIn extends AbstractField {
    evaluate(item) {
        let values = this._getFieldValues(item);

        if(!values) return {passed: false};

        for(let value of values) {
            if(this._value.indexOf(value) !== -1) {
                return {matches: 1, checks: 1, passed: true};
            }
        }

        return {passed: false};
    }
}