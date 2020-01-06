import uuid from 'uuidv4';

export default class QueueItem {

    /**
     *
     * @param {{}} data
     */
    constructor(data = {}) {
        this._id = data.hasOwnProperty('id') ? data.id:uuid();
        this._task = data.hasOwnProperty('task') ? data.task:{};
        this._result = data.hasOwnProperty('result') ? data.result:{};
        this._success = data.hasOwnProperty('success') ? data.success:null;
    }

    /**
     *
     * @returns {string}
     */
    getId() {
        return this._id;
    }

    /**
     *
     * @param {string} value
     * @returns {QueueItem}
     */
    setId(value) {
        this._id = value;

        return this;
    }

    /**
     *
     * @returns {{}|*}
     */
    getTask() {
        return this._task;
    }

    /**
     *
     * @param {{}|*} value
     * @returns {QueueItem}
     */
    setTask(value) {
        this._task = value;

        return this;
    }

    /**
     *
     * @returns {{}|*}
     */
    getResult() {
        return this._result;
    }

    /**
     *
     * @param {{}|*} value
     * @returns {QueueItem}
     */
    setResult(value) {
        this._result = value;

        return this;
    }

    /**
     *
     * @returns {boolean|null}
     */
    getSuccess() {
        return this._success;
    }

    /**
     *
     * @param {boolean} value
     * @returns {QueueItem}
     */
    setSuccess(value) {
        this._success = value;

        return this;
    }

    /**
     *
     * @returns {{result: ({}|*), task: ({}|*), success: (null|boolean), id: (string)}}
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