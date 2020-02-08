import FormService from '@js/Services/FormService';
import AbstractController from '@js/Controller/AbstractController';

export default class FillPassword extends AbstractController {

    /**
     *
     * @param {Message} message
     * @param {Message} reply
     */
    async execute(message, reply) {
        this._fillPassword(message.getPayload().user, message.getPayload().password);
    }

    /**
     *
     * @param {String} user
     * @param {String} password
     */
    _fillPassword(user, password) {
        let forms = new FormService().getLoginFields();
        for(let i = 0; i < forms.length; i++) {
            let form = forms[i];
            if(form.user) {
                form.user.value = user;
                form.user.dispatchEvent(new Event('change', {bubbles: true, cancelable: true}));
                form.user.dispatchEvent(new Event('blur', {bubbles: true, cancelable: true}));
            }

            form.pass.value = password;
            form.pass.dispatchEvent(new Event('change', {bubbles: true, cancelable: true}));
            form.pass.dispatchEvent(new Event('blur', {bubbles: true, cancelable: true}));

            if(forms.length !== 1) continue;
            if(form.submit) {
                form.submit.dispatchEvent(new Event('click', {bubbles: true, cancelable: true}));
            } else if(form.secure) {
                let data = {key: 'Enter', code: 'Enter', which: 13, keyCode: 13, bubbles: true, cancelable: true};
                form.pass.dispatchEvent(new KeyboardEvent('keydown', data));
                form.pass.dispatchEvent(new KeyboardEvent('keypress', data));
                form.pass.dispatchEvent(new KeyboardEvent('keyup', data));
            }
        }
    }
}