import AbstractSearchField from '@js/NextSearch/Field/AbstractSearchField';

export default class FieldNotMatches extends AbstractSearchField {

    get TYPE() {
        return 'notMatches';
    }

    /**
     * @inheritDoc
     */
    evaluate(item) {
        let value = item.getProperty(this._name);

        if(!value) return {matches: 1, checks: 1, passed: true};

        let regexp = new RegExp(this._value, 'g');
        let matches = regexp.exec(value);

        if(matches.length > 1) {
            return {passed: false};
        }

        return {matches: 1, checks: 1, passed: true};
    }
}