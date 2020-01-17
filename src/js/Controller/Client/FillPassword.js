import FormService from '@js/Services/FormService';
import AbstractController from '@js/Controller/AbstractController';

export default class FillPassword extends AbstractController {

    /**
     *
     * @param {Message} message
     * @param {Message} reply
     */
    async execute(message, reply) {
        this._fillPassword(message.getPayload().user, message.getPayload().password)
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
                form.submit.click();
            } else if(form.secure) {
                form.form.dispatchEvent(new Event('submit', {bubbles: true, cancelable: true}));
            }
        }
    }
}