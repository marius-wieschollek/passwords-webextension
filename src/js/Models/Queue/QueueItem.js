import UuidHelper from "@js/Helper/UuidHelper";

export default class QueueItem {

    /**
     *
     * @param {Object} data
     */
    constructor(data = {}) {
        this._id = data.hasOwnProperty('id') ? data.id:UuidHelper.generate();
        this._task = data.hasOwnProperty('task') ? data.task:{};
        this._result = data.hasOwnProperty('result') ? data.result:{};
        this._success = data.hasOwnProperty('success') ? data.success:null;
        this._cancelled = data.hasOwnProperty('cancelled') ? data.cancelled:false;
    }

    /**
     *
     * @returns {String}
     */
    getId() {
        return this._id;
    }

    /**
     *
     * @param {String} value
     * @returns {QueueItem}
     */
    setId(value) {
        this._id = value;

        return this;
    }

    /**
     *
     * @returns {(Object|*)}
     */
    getTask() {
        return this._task;
    }

    /**
     *
     * @param {(Object|*)} value
     * @returns {this}
     */
    setTask(value) {
        this._task = value;

        return this;
    }

    /**
     *
     * @returns {(Object|*)}
     */
    getResult() {
        return this._result;
    }

    /**
     *
     * @param {(Object|*)} value
     * @return {this}
     */
    setResult(value) {
        this._result = value;

        return this;
    }

    /**
     *
     * @return {(Boolean|null)}
     */
    getSuccess() {
        return this._success;
    }

    /**
     *
     * @param {Boolean} value
     * @return {this}
     */
    setSuccess(value) {
        this._success = value;

        return this;
    }

    /**
     *
     * @return {(Boolean|null)}
     */
    getCancelled() {
        return this._cancelled;
    }

    /**
     *
     * @param {Boolean} value
     * @return {this}
     */
    setCancelled(value) {
        this._cancelled = value;

        return this;
    }

    /**
     *
     * @return {{result: *, task: *, success: Boolean, id: String}}
     */
    toJSON() {
        return {
            id       : this._id,
            task     : this._task,
            result   : this._result,
            success  : this._success,
            cancelled: this._cancelled
        };
    }
}