import AbstractModel from 'passwords-client/src/Model/AbstractModel';
import Properties from '@js/Definition/Theme';

export default class Theme extends AbstractModel {

    constructor(data) {
        super(Properties, data);
    }

    /**
     * @return {Object}
     */
    getId() {
        return this.getProperty('id');
    }

    /**
     * @param {String} value
     * @return {this}
     */
    setId(value) {
        return this.setProperty('id', value);
    }

    /**
     * @return {String}
     */
    getLabel() {
        return this.getProperty('label');
    }

    /**
     * @param {String} value
     * @return {this}
     */
    setLabel(value) {
        return this.setProperty('label', value);
    }

    /**
     * @return {String}
     */
    getType() {
        return this.getProperty('type');
    }

    /**
     * @param {String} value
     * @return {this}
     */
    setType(value) {
        return this.setProperty('type', value);
    }

    /**
     * @return {Boolean}
     */
    getStyle() {
        return this.getProperty('style');
    }

    /**
     * @param {Boolean} value
     * @return {this}
     */
    setStyle(value) {
        return this.setProperty('style', value);
    }

    /**
     * @return {Object}
     */
    getColors() {
        return this.getProperty('colors');
    }

    /**
     * @param {Object} value
     * @return {this}
     */
    setColors(value) {
        return this.setProperty('colors', value);
    }

    /**
     * @return {Object}
     */
    getVariables() {
        return this.getProperty('variables');
    }

    /**
     * @param {Object} value
     * @return {this}
     */
    setVariables(value) {
        return this.setProperty('variables', value);
    }

    /**
     * @return {Object}
     */
    getBadge() {
        return this.getProperty('badge');
    }

    /**
     * @param {Object} value
     * @return {this}
     */
    setBadge(value) {
        return this.setProperty('badge', value);
    }

    /**
     * @return {String}
     */
    getBadgeIcon() {
        return this._getSubProperty('badge', 'icon');
    }

    /**
     * @param {String} value
     * @return {this}
     */
    setBadgeIcon(value) {
        return this._setSubProperty('badge', 'icon', value);
    }

    /**
     * @return {String}
     */
    getBadgeBackgroundColor() {
        return this._getSubProperty('badge', 'color-bg');
    }

    /**
     * @param {String} value
     * @return {this}
     */
    setBadgeBackgroundColor(value) {
        return this._setSubProperty('badge', 'color-bg', value);
    }

    /**
     * @return {String}
     */
    getBadgeForegroundColor() {
        return this._getSubProperty('badge', 'color-fg');
    }

    /**
     * @param {String} value
     * @return {this}
     */
    setBadgeForegroundColor(value) {
        return this._setSubProperty('badge', 'color-fg', value);
    }

    /**
     * @return {Object}
     */
    getFont() {
        return this.getProperty('font');
    }

    /**
     * @param {Object} value
     * @return {this}
     */
    setFont(value) {
        return this.setProperty('font', value);
    }

    /**
     * @return {String}
     */
    getFontFamily() {
        return this._getSubProperty('font', 'family');
    }

    /**
     * @param {String} value
     * @return {this}
     */
    setFontFamily(value) {
        return this._setSubProperty('font', 'family', value);
    }

    /**
     * @return {String}
     */
    getFontSize() {
        return this._getSubProperty('font', 'size');
    }

    /**
     * @param {String} value
     * @return {this}
     */
    setFontSize(value) {
        return this._setSubProperty('font', 'size', value);
    }

    /**
     * @param {String} property
     * @param {String} key
     * @return {(null|String)}
     * @private
     */
    _getSubProperty(property, key) {
        let data = this.getProperty(property);
        if(data !== null && data !== undefined && data.hasOwnProperty(key)) return data[key];

        return null;
    }

    /**
     * @param {String} property
     * @param {String} key
     * @param {String} value
     * @return {this}
     * @private
     */
    _setSubProperty(property, key, value) {
        let data = this.getProperty(property);
        if(data === null || data === undefined) data = {};
        data[key] = value;

        return this.setProperty(property, data);
    }
}