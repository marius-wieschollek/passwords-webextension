import FeedbackItem from '@js/Models/Queue/FeedbackItem';

export default class MiningItem extends FeedbackItem {


    /**
     *
     * @returns {MiningItem}
     */
    addField(name, value) {
        let task = this.getTask();
        if(!task.hasOwnProperty('fields')) task.fields = {};
        task.fields[name] = value;
        this.setTask(task);

        return this;
    }

    /**
     *
     * @param name
     * @return {*}
     */
    getField(name) {
        let task = this.getTask();
        if(task.hasOwnProperty('fields') && task.fields.hasOwnProperty(name)) {
            return task.fields[name];
        }

        return undefined;
    }

    /**
     *
     */
    getFields() {
        let task = this.getTask();

        return task.hasOwnProperty('fields') ? task.fields:{};
    }

    /**
     *
     * @returns {Boolean}
     */
    getLabel() {
        let fields = this.getFields();

        return fields.hasOwnProperty('label') ? fields.label:'MinedPasswordNoLabel';
    }


    /**
     *
     * @returns {MiningItem}
     */
    setNew(value) {
        let task = this.getTask();
        task.new = value;
        this.setTask(task);

        return this;
    }

    /**
     *
     * @returns {Boolean}
     */
    isNew() {
        let task = this.getTask();

        return task.hasOwnProperty('new') && task.new;
    }

}