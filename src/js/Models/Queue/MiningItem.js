import FeedbackItem from '@js/Models/Queue/FeedbackItem';

export default class MiningItem extends FeedbackItem {


    /**
     *
     * @returns {MiningItem}
     */
    setTaskField(name, value) {
        let task = this.getTask();
        if(!task.hasOwnProperty('fields')) task.fields = {};
        task.fields[name] = value;
        this.setTask(task);
        this.setResultField(name, value);

        return this;
    }


    /**
     *
     * @returns {MiningItem}
     */
    setTaskNew(value) {
        let task = this.getTask();
        task.new = value;
        this.setTask(task);

        return this;
    }

    /**
     *
     * @returns {MiningItem}
     */
    setResultField(name, value) {
        let result = this.getResult();
        if(!result.hasOwnProperty('fields')) result.fields = {};
        result.fields[name] = value;
        this.setResult(result);

        return this;
    }

    /**
     *
     * @param name
     * @return {*}
     */
    getResultField(name) {
        let result = this.getResult();
        if(result.hasOwnProperty('fields') && result.fields.hasOwnProperty(name)) {
            return result.fields[name];
        }

        return undefined;
    }

    /**
     *
     */
    getResultFields() {
        let result = this.getResult();
        if(result.hasOwnProperty('fields')) {
            return result.fields;
        }

        return {};
    }

    /**
     *
     */
    listResultFields() {
        let task = this.getResult();

        return Object.keys(task.fields);
    }

    /**
     *
     * @returns {Boolean}
     */
    getLabel() {
        let label = this.getResultField('label');

        return label ? label:'MinedPasswordNoLabel';
    }


    /**
     *
     * @returns {MiningItem}
     */
    setResultNew(value) {
        let result = this.getResult();
        result.new = value;
        this.setResult(result);

        return this;
    }

    /**
     *
     * @returns {Boolean}
     */
    isNew() {
        let task   = this.getTask(),
            result = this.getResult();

        return (task.hasOwnProperty('new') && task.new) || (result.hasOwnProperty('new') && result.new);
    }


    /**
     *
     * @returns {MiningItem}
     */
    setDiscarded(value) {
        let result = this.getResult();
        result.discarded = value;
        this.setResult(result);

        return this;
    }

    /**
     *
     * @returns {Boolean}
     */
    isDiscarded() {
        let result = this.getResult();

        return result.hasOwnProperty('discarded') && result.discarded;
    }

}