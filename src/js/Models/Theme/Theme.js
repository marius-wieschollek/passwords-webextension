import AbstractModel from 'passwords-client/src/Model/AbstractModel';
import Properties from '@js/Definition/Theme'

export default class Theme extends AbstractModel {

    constructor(data) {
        super(Properties, data);
    }

    /**
     * @return {Object}
     */
    getId() {
        return this.getProperty('id')
    }
    
    /**
     * @param {String} value
     * @return {this}
     */
    setId(value) {
        return this.setProperty('id', value)
    }

    /**
     * @return {Object}
     */
    getLabel() {
        return this.getProperty('label')
    }
    
    /**
     * @param {String} value
     * @return {this}
     */
    setLabel(value) {
        return this.setProperty('label', value)
    }

    /**
     * @return {Object}
     */
    getColors() {
        return this.getProperty('colors')
    }
    
    /**
     * @param {Object} value
     * @return {this}
     */
    setColors(value) {
        return this.setProperty('colors', value)
    }
}