import AbstractSearchField from '@js/NextSearch/Field/AbstractSearchField';

export default class FieldIn extends AbstractSearchField {

    get TYPE() {
        return 'in';
    }

    /**
     * @inheritDoc
     */
    evaluate(item) {
        let value = item.getProperty(this._name);

        if(!value) return {passed: false};

        if(this._value.indexOf(value) !== -1) {
            return {matches: 1, checks: 1, passed: true};
        }

        return {passed: false};
    }
}