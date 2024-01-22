import AbstractPagination from "@js/Search/Query/Pagination/AbstractPagination";

export default class Pagination extends AbstractPagination {

    constructor(page, size) {
        super();
        this._page = page;
        this._size = size;
    }

    apply(items) {
        let start = this._page * this._size;

        if(start > items.length) {
            return [];
        }

        return items.splice(start, this._size);
    }
}