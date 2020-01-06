import AbstractField from '@js/Search/Query/Field/AbstractField';

export default class FieldContains extends AbstractField {

    evaluate(item) {
        let values = this._getFieldValues(item);

        if(!values) return {passed: false};

        let search = this._value.toLowerCase();
        for(let value of values) {
            if(value.indexOf(search) !== -1) {
                return  {matches: 1, checks: 1, passed: true};
            }
        }

        return {passed: false};
    }
}