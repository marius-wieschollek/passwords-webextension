import AbstractSearchField from '@js/NextSearch/Field/AbstractSearchField';

export default class FieldNotIn extends AbstractSearchField {

    get TYPE() {
        return 'notIn';
    }

    /**
     * @inheritDoc
     */
    evaluate(item) {
        let value = item.getProperty(this._name);

        if(!value) return {matches: 1, checks: 1, passed: true};

        if(this._value.indexOf(value) !== -1) {
            return {passed: false};
        }

        return {matches: 1, checks: 1, passed: true};
    }
}