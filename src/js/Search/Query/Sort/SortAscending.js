import AbstractSort from '@js/Search/Query/Sort/AbstractSort';

export default class SortAscending extends AbstractSort {

    _compareValues(a, b) {
        if(a === b) return 0;
        if(typeof a === 'string') return a.localeCompare(b, 'kn', {sensitivity: 'base'});
        return a < b ? -1:1;
    }
}