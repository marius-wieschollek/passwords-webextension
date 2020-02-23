import FeedbackItem from '@js/Models/Queue/FeedbackItem';

export default class MiningItem extends FeedbackItem {


    /**
     * @param {String} name
     * @param {*} value
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
     * @param {Boolean} value
     * @returns {MiningItem}
     */
    setTaskNew(value) {
        let task = this.getTask();
        task.new = value;
        this.setTask(task);

        return this;
    }

    /**
     * @param {String} name
     * @param {*} value
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
     * @param {String} name
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
     * @return {Object}
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
     * @return {String[]}
     */
    listResultFields() {
        let task = this.getResult();

        return Object.keys(task.fields);
    }

    /**
     *
     * @returns {String}
     */
    getLabel() {
        let label = this.getResultField('label');

        return label ? label:'MinedPasswordNoLabel';
    }


    /**
     * @param {Boolean} value
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
     * @param {Boolean} value
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