import uuid from 'uuidv4';
import LocalisationService from '@js/Services/LocalisationService';
import SystemService from '@js/Services/SystemService';

export default class AbstractNotification {

    constructor() {
        this._id = uuid();
        this._title = 'NotificationNoTitle';
        this._text = 'NotificationNoText';
        this._type = 'basic';
        this._iconUrl = 'img/passwords-48.png';
    }

    /**
     * @return {String}
     */
    getId() {
        return this._id;
    }

    /**
     * @return {String}
     */
    getIconUrl() {
        return this._iconUrl;
    }

    /**
     * @return {String}
     */
    getTitle() {
        return LocalisationService.translate(this._title);
    }

    /**
     * @param {String} key
     * @param {String} variables
     * @return {this}
     */
    setTitle(key, ...variables) {
        this._title = [key, variables];

        return this;
    }

    /**
     * @return {String}
     */
    getText() {
        return LocalisationService.translate(this._text);
    }

    /**
     * @param {String} key
     * @param {String} variables
     * @return {this}
     */
    setText(key, ...variables) {
        this._text = [key, variables];

        return this;
    }


    /**
     * @return {String}
     */
    getType() {
        return this._type;
    }


    /**
     * @param {String} value
     * @return {this}
     */
    setType(value) {
        if(['basic', 'image', 'list', 'progress'].indexOf(value)) {
            this._type = value;
        }

        return this;
    }

    /**
     * @return {Boolean}
     */
    hasButtons() {
        return typeof this.getButtons === 'function' && SystemService.hasNotificationButtons()
    }

    /**
     * @return {{message: String, type: String, title: String, iconUrl: String}}
     */
    getOptions() {
        let data = {
            type : this.getType(),
            title: this.getTitle(),
            message : this.getText(),
            iconUrl : this.getIconUrl()
        };

        if(this.hasButtons()) {
            data.buttons = this.getButtons();
        }

        return data;
    }
}