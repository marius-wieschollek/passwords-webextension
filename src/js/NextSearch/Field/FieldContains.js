import AbstractSearchField from '@js/NextSearch/Field/AbstractSearchField';

export default class FieldContains extends AbstractSearchField {

    get TYPE() {
        return 'contains';
    }

    /**
     * @inheritDoc
     */
    evaluate(item) {
        let value = item.getProperty(this._name);

        if(!value) return {passed: false};

        let search = this._value.toString().toLowerCase();
        if(value.toString().toLowerCase().indexOf(search) !== -1) {
            return {matches: 1, checks: 1, passed: true};
        }

        return {passed: false};
    }
}