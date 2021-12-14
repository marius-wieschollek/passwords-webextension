import AbstractSearchSort from '@js/NextSearch/Sort/AbstractSearchSort';

export default class SortAscending extends AbstractSearchSort {

    get TYPE() {
        return 'ascending';
    }

    _compareValues(a, b) {
        if(a === b) return 0;
        if(typeof a === 'string') {
            if(b === null) return -1;
            return a.localeCompare(b, undefined, {numeric: true, sensitivity: 'base'});
        }
        return a < b ? -1 : 1;
    }
}