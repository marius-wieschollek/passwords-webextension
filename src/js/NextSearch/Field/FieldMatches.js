import AbstractSearchField from '@js/NextSearch/Field/AbstractSearchField';

export default class FieldMatches extends AbstractSearchField {

    get TYPE() {
        return 'matches';
    }

    /**
     * @inheritDoc
     */
    evaluate(item) {
        let value = item.getProperty(this._name);

        if(!value) return {passed: false};

        let regexp  = new RegExp(this._value, 'g'),
            matches = regexp.exec(value);
        if(matches.length > 1) {
            return {matches: 1, checks: 1, passed: true};
        }

        return {passed: false};
    }
}