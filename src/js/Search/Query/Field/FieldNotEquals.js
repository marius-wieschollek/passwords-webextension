import AbstractField from '@js/Search/Query/Field/AbstractField';

export default class FieldNotEquals extends AbstractField {

    evaluate(item) {
        let values = this._getFieldValues(item);

        if(!values) return {matches: 1, checks: 1, passed: true};

        let search = this._value.toLowerCase();
        for(let value of values) {
            if(value === search) return  {passed: false};
        }

        return {matches: 1, checks: 1, passed: true};
    }
}