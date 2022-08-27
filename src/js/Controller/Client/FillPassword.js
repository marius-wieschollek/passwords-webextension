import FormService from '@js/Services/FormService';
import AbstractController from '@js/Controller/AbstractController';
import ErrorManager from "@js/Manager/ErrorManager";

export default class FillPassword extends AbstractController {

    /**
     *
     * @param {Message} message
     * @param {Message} reply
     */
    async execute(message, reply) {
        try {
            let result = this._fillPassword(message.getPayload().user, message.getPayload().password, message.getPayload().submit, message.getPayload().formFields);

            if(result) reply.setPayload(true);
        } catch(e) {
            ErrorManager.logError(e)
        }
    }

    /**
     *
     * @param {String} user
     * @param {String} password
     * @param {Boolean} trySubmit
     * @param {Array} formFields
     * @returns {Boolean}
     */
    _fillPassword(user, password, trySubmit, formFields) {
        let forms = new FormService().getLoginFields();
        if(forms.length === 0) return false;

        this._fillCustomForms(formFields);

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

        return true;
    }

     /**
     *
     * @param {Array} formFields
     */
      _fillCustomForms(formFields) {
        formFields.forEach((field) => {
            let element = document.getElementById(field.id);
            if(element !== null && element !== undefined) {
            if(!element.readOnly && !element.disabled && !element.hidden) {
                    this._insertTextIntoField(element, field.value);
                }
            }
        })
        
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