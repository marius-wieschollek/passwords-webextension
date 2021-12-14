import AbstractSearchField from '@js/NextSearch/Field/AbstractSearchField';

export default class FieldEquals extends AbstractSearchField {

    get TYPE() {
        return 'equals';
    }

    /**
     * @inheritDoc
     */
    evaluate(item) {
        let value = item.getProperty(this._name);

        if(!value) return {passed: false};
        if(value === this._value) return {matches: 1, checks: 1, passed: true};

        return {passed: false};
    }
}