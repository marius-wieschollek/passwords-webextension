import AbstractSearchField from '@js/NextSearch/Field/AbstractSearchField';

export default class FieldNotEquals extends AbstractSearchField {

    get TYPE() {
        return 'notEquals';
    }

    /**
     * @inheritDoc
     */
    evaluate(item) {
        let value = item.getProperty(this._name);

        if(!value) return {matches: 1, checks: 1, passed: true};
        if(value === this._value) return {passed: false};

        return {matches: 1, checks: 1, passed: true};
    }
}