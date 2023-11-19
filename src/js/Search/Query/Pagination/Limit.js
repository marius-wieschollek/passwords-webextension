import AbstractPagination from "@js/Search/Query/Pagination/AbstractPagination";

export default class Limit extends AbstractPagination {

    constructor(size) {
        super();
        this._size = size;
    }

    apply(items) {
        if(this._size > items.length) {
            return items;
        }

        return items.splice(0, this._size);
    }
}