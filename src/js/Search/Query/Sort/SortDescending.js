import AbstractSort from '@js/Search/Query/Sort/AbstractSort';

export default class SortDescending extends AbstractSort {

    _compareValues(a, b) {
        if(a === b) return 0;
        if(typeof a === 'string') {
            if(b === null) return 1;
            return b.localeCompare(a, undefined, {numeric: true, sensitivity: 'base'});
        }
        return b < a ? -1:1;
    }
}