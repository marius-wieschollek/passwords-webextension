import AbstractModel from 'passwords-client/src/Model/AbstractModel';
import Properties from '../../Definition/Toast';

export default class Toast extends AbstractModel {

    /**
     * @param {Object} [data={}]
     */
    constructor(data = {}) {
        super(Properties, data);
    }

    /**
     * @return {String}
     */
    getId() {
        return this.getProperty('id');
    }

    /**
     * @param {String} value
     * @return {Toast}
     */
    setId(value) {
        return this.setProperty('id', value);
    }

    /**
     * @return {String}
     */
    getTitle() {
        return this.getProperty('title');
    }

    /**
     * @param {String} value
     * @return {Toast}
     */
    setTitle(value) {
        return this.setProperty('title', value);
    }

    /**
     * @return {Array}
     */
    getTitleVars() {
        return this.getProperty('titleVars');
    }

    /**
     * @param {Array} value
     * @return {Toast}
     */
    setTitleVars(value) {
        return this.setProperty('titleVars', value);
    }

    /**
     * @return {String}
     */
    getMessage() {
        return this.getProperty('message');
    }

    /**
     * @param {String} value
     * @return {Toast}
     */
    setMessage(value) {
        return this.setProperty('message', value);
    }

    /**
     * @return {Array}
     */
    getMessageVars() {
        return this.getProperty('messageVars');
    }

    /**
     * @param {Array} value
     * @return {Toast}
     */
    setMessageVars(value) {
        return this.setProperty('messageVars', value);
    }

    /**
     * @return {String}
     */
    getType() {
        return this.getProperty('type');
    }

    /**
     * @param {String} value
     * @return {Toast}
     */
    setType(value) {
        return this.setProperty('type', value);
    }

    /**
     * @return {Number}
     */
    getTtl() {
        return this.getProperty('ttl');
    }

    /**
     * @param {Number} value
     * @return {Toast}
     */
    setTtl(value) {
        return this.setProperty('ttl', value);
    }

    /**
     * @return {Boolean}
     */
    getVisible() {
        return this.getProperty('visible');
    }

    /**
     * @param {Boolean} value
     * @return {Toast}
     */
    setVisible(value) {
        return this.setProperty('visible', value);
    }

    /**
     * @return {Boolean}
     */
    getCloseable() {
        return this.getProperty('closeable');
    }

    /**
     * @param {Boolean} value
     * @return {Toast}
     */
    setCloseable(value) {
        return this.setProperty('closeable', value);
    }

    /**
     * @return {Object}
     */
    getOptions() {
        return this.getProperty('options');
    }

    /**
     * @param {Object} value
     * @return {Toast}
     */
    setOptions(value) {
        return this.setProperty('options', value);
    }

    /**
     * @return {String[]}
     */
    getTags() {
        return this.getProperty('tags');
    }

    /**
     * @param {String[]} value
     * @return {Toast}
     */
    setTags(value) {
        return this.setProperty('tags', value);
    }
}