import FormService from '@js/Services/FormService';
import AbstractController from '@js/Controller/AbstractController';

export default class FillPassword extends AbstractController {

    /**
     *
     * @param {Message} message
     * @param {Message} reply
     */
    async execute(message, reply) {
        this._fillPassword(message.getPayload().user, message.getPayload().password, message.getPayload().submit);
    }

    /**
     *
     * @param {String} user
     * @param {String} password
     * @param {Boolean} trySubmit
     */
    _fillPassword(user, password, trySubmit) {
        let forms = new FormService().getLoginFields();
        for(let i = 0; i < forms.length; i++) {
            let form = forms[i];
            if(form.user) this._insertTextIntoField(form.user, user);
            this._insertTextIntoField(form.pass, password);

            if(!trySubmit || forms.length !== 1) continue;
            if(form.submit) {
                this._simulateClick(form.submit);
            } else if(form.secure) {
                this._simulateEnter(form.pass);
            }
        }
    }

    /**
     *
     * @param {Element} field
     * @param {String} value
     * @private
     */
    _insertTextIntoField(field, value) {
        let bubbleEvent   = {bubbles: true, cancelable: true},
            noBubbleEvent = {bubbles: false, cancelable: true},
            insertEvent   = {bubbles: true, cancelable: false, inputType: 'inserting', data: value};

        field.dispatchEvent(new FocusEvent('focus', noBubbleEvent));
        field.dispatchEvent(new FocusEvent('focusin', bubbleEvent));
        field.value = value;
        field.dispatchEvent(new InputEvent('input', insertEvent));
        field.dispatchEvent(new Event('change', insertEvent));
        field.dispatchEvent(new FocusEvent('focusout', bubbleEvent));
        field.dispatchEvent(new FocusEvent('blur', noBubbleEvent));
    }

    /**
     *
     * @param {HTMLElement} element
     * @private
     */
    _simulateClick(element) {
        let left          = element.offsetLeft + Math.round(element.offsetWidth / 2),
            top           = element.offsetTop + Math.round(element.offsetHeight / 2),
            bubbleEvent   = {screenX: left, screenY: top, clientX: left, clientY: top, bubbles: true, cancelable: true},
            noBubbleEvent = {screenX: left, screenY: top, clientX: left, clientY: top, bubbles: false, cancelable: false};

        element.dispatchEvent(new MouseEvent('mouseover', bubbleEvent));
        element.dispatchEvent(new MouseEvent('mouseenter', noBubbleEvent));
        element.dispatchEvent(new MouseEvent('mousemove', bubbleEvent));
        element.dispatchEvent(new MouseEvent('mousedown', bubbleEvent));
        element.dispatchEvent(new MouseEvent('click', bubbleEvent));
        element.dispatchEvent(new MouseEvent('mouseup', bubbleEvent));
        element.dispatchEvent(new MouseEvent('mousemove', bubbleEvent));
        element.dispatchEvent(new MouseEvent('mouseleave', noBubbleEvent));
        element.dispatchEvent(new MouseEvent('mouseout', bubbleEvent));
    }

    /**
     *
     * @param {HTMLElement} element
     * @private
     */
    _simulateEnter(element) {
        let data = {key: 'Enter', code: 'Enter', which: 13, keyCode: 13, bubbles: false, cancelable: true};
        element.dispatchEvent(new KeyboardEvent('keydown', data));
        element.dispatchEvent(new KeyboardEvent('keypress', data));
        element.dispatchEvent(new KeyboardEvent('keyup', data));
    }
}