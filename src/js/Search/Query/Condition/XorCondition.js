import AbstractCondition from '@js/Search/Query/Condition/AbstractCondition';

export default class XorCondition extends AbstractCondition {

    /**
     * @inheritDoc
     */
    evaluate(item) {
        let result = {matches: 0, checks: 0, score:0, passed: false};

        for(let condition of this._conditions) {
            let partialResult = condition.evaluate(item);

            if(partialResult.passed) {
                if(result.passed) return {matches: 0, checks: 0, score:0, passed: false};

                result.passed = true;
                result.matches = partialResult.matches;
                result.checks = partialResult.checks;
                result.score = partialResult.score;
            }
        }

        return result;
    }
}