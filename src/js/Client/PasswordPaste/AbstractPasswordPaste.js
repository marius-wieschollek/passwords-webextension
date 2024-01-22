export default class AbstractPasswordPaste {

    /** @type {PasswordPasteRequest} **/
    _passwordPasteRequest;

    /**
     *
     * @param {PasswordPasteRequest} passwordPasteRequest
     */
    constructor(passwordPasteRequest) {
        this._passwordPasteRequest = passwordPasteRequest;
    }

    /**
     *
     * @return {Boolean}
     */
    canHandle() {
        return false;
    }

    /**
     *
     * @return {Promise<Boolean>}
     */
    async handle() {
        return false;
    }

    /**
     * Paste the given content into the given form fields
     *
     * @param {Array} formFields
     */
    _fillFormFields(formFields) {
        formFields.forEach((field) => {
            let element = document.getElementById(field.id);
            if (element !== null && element !== undefined) {
                if (!element.readOnly && !element.disabled && !element.hidden) {
                    this._insertTextIntoField(element, field.value);
                }
            }
        });
    }


    /**
     * Simulate the user typing the given value into the given html input element
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
     * Simulate the user clicking the given html element with the mouse
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
     * Simulate the user pressing the "Enter" key on the given html element
     *
     * @param {HTMLElement} element
     * @private
     */
    _simulateEnter(element) {
        let data = {key: 'Enter', code: 'Enter', which: 13, keyCode: 13, bubbles: true, cancelable: true};
        element.dispatchEvent(new KeyboardEvent('keydown', data));
        element.dispatchEvent(new KeyboardEvent('keypress', data));
        element.dispatchEvent(new KeyboardEvent('keyup', data));
    }



    /**
     * Simulate the user moving the mouse over the given html element
     *
     * @param {HTMLElement} element
     * @private
     */
    _simulateMouseMove(element) {
        let left          = element.offsetLeft + Math.round(element.offsetWidth / 2),
            top           = element.offsetTop + Math.round(element.offsetHeight / 2),
            bubbleEvent   = {screenX: left, screenY: top, clientX: left, clientY: top, bubbles: true, cancelable: true}

        element.dispatchEvent(new MouseEvent('mouseover', bubbleEvent));
        element.dispatchEvent(new MouseEvent('mouseenter', bubbleEvent));
        element.dispatchEvent(new MouseEvent('mousemove', bubbleEvent));
    }

    /**
     * Wait for an element matching the given selector to appear
     * within the given time and then return it
     *
     * @param {String} selector CSS selector of the element
     * @param {Number} time     Wait time in milliseconds
     * @return {Promise<HTMLElement>}
     * @private
     */
    _waitForElement(selector, time = 1000) {
        let currentTime   = 0,
            checkFunction = (resolve, reject) => {
                let element = document.querySelector(selector);

                if (element) {
                    resolve(element);
                } else if (currentTime < time) {
                    currentTime += 25;
                    setTimeout(() => {
                        checkFunction(resolve, reject);
                    }, 25);
                } else {
                    reject(new Error(`Could not find ${selector} after ${time}ms`));
                }
            };

        return new Promise((resolve, reject) => {
            checkFunction(resolve, reject);
        });
    }

    /**
     * Wait for the given amount of milliseconds
     *
     * @param {Number} time
     * @return {Promise<void>}
     * @private
     */
    _wait(time) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve();
            }, time);
        });
    }
}