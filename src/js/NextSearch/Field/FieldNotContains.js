import AbstractSearchField from '@js/NextSearch/Field/AbstractSearchField';

export default class FieldNotContains extends AbstractSearchField {

    get TYPE() {
        return 'notContains';
    }

    /**
     * @inheritDoc
     */
    evaluate(item) {
        let value = item.getProperty(this._name);

        if(!value) return {matches: 1, checks: 1, passed: true};

        let search = this._value.toString().toLowerCase();
        if(value.toString().toLowerCase().indexOf(search) !== -1) {
            return {passed: false};
        }

        return {matches: 1, checks: 1, passed: true};
    }
}