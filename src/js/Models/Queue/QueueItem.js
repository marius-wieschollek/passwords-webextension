import uuid from 'uuidv4';

export default class QueueItem {

    /**
     *
     * @param {Object} data
     */
    constructor(data = {}) {
        this._id = data.hasOwnProperty('id') ? data.id:uuid();
        this._task = data.hasOwnProperty('task') ? data.task:{};
        this._result = data.hasOwnProperty('result') ? data.result:{};
        this._success = data.hasOwnProperty('success') ? data.success:null;
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
     * @returns {QueueItem}
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
     * @return {QueueItem}
     */
    setResult(value) {
        this._result = value;

        return this;
    }

    /**
     *
     * @returns {(Boolean|null)}
     */
    getSuccess() {
        return this._success;
    }

    /**
     *
     * @param {Boolean} value
     * @returns {QueueItem}
     */
    setSuccess(value) {
        this._success = value;

        return this;
    }

    /**
     *
     * @return {{result: *, task: *, success: Boolean, id: String}}
     */
    toJSON() {
        return {
            id     : this._id,
            task   : this._task,
            result : this._result,
            success: this._success
        };
    }
}