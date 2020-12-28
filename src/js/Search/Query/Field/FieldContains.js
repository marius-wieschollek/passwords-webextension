import AbstractField from '@js/Search/Query/Field/AbstractField';

export default class FieldContains extends AbstractField {


    constructor(name, value, weight = 1) {
        super(name, value);

        if(weight <= 0) weight = 1;
        this._weight = weight;
    }

    /**
     * @inheritDoc
     */
    evaluate(item) {
        let values = this._getFieldValues(item);

        if(!values) return {passed: false};

        let search = this._value.toLowerCase(),
            checks = 0,
            matches = 0;

        for(let value of values) {
            checks++;
            if(value.indexOf(search) !== -1) {
                matches += value.split(search).length - 1;
            }
        }

        if(this._weight !== 1) matches *= this._weight;
        if(matches > 0) return {matches, checks, passed: true};

        return {checks, passed: false};
    }
}