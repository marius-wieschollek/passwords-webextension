import AbstractField from '@js/Search/Query/Field/AbstractField';

export default class FieldNotIn extends AbstractField {

    /**
     * @inheritDoc
     */
    evaluate(item) {
        let values = this._getFieldValues(item);

        if(!values) return {matches: 1, checks: 1, passed: true};

        for(let value of values) {
            if(this._value.indexOf(value) !== -1) {
                return {passed: false};
            }
        }

        return {matches: 1, checks: 1, passed: true};
    }
}