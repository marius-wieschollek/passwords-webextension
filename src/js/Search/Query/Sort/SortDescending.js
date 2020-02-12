import AbstractSort from '@js/Search/Query/Sort/AbstractSort';

export default class SortDescending extends AbstractSort {

    _compareValues(a, b) {
        if(a === b) return 0;
        if(typeof a === 'string') {
            if(b === null) return 1;
            return b.localeCompare(a, 'kn', {sensitivity: 'base'});
        }
        return b < a ? -1:1;
    }
}