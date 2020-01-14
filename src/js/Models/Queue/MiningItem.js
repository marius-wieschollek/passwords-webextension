import FeedbackItem from '@js/Models/Queue/FeedbackItem';

export default class MiningItem extends FeedbackItem{


    /**
     *
     * @param {Password} value
     * @returns {MiningItem}
     */
    setPassword(value) {
        let task = this.getTask();
        task.password = value;
        this.setTask(task);

        return this;
    }

    /**
     *
     * @returns {(Password|Object)}
     */
    getPassword() {
        let task = this.getTask();

        return task.password;
    }

    /**
     *
     * @param value
     * @returns {MiningItem}
     */
    setNew(value) {
        let task = this.getTask();
        task.isNew = value;
        this.setTask(task);

        return this;
    }

    /**
     *
     * @returns {string}
     */
    isNew() {
        let task = this.getTask();

        return task.isNew;
    }

}