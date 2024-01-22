import AbstractPasswordPaste from "@js/Client/PasswordPaste/AbstractPasswordPaste";
import FormService from "@js/Services/FormService";

export default class GenericPasswordPaste extends AbstractPasswordPaste {

    canHandle() {
        let forms = new FormService().getLoginFields();
        return forms.length !== 0;
    }

    async handle() {
        let forms = new FormService().getLoginFields();
        if (forms.length === 0) return false;

        this._fillFormFields(this._passwordPasteRequest.getFormFields());

        for (let i = 0; i < forms.length; i++) {
            let form = forms[i];
            if (this._passwordPasteRequest.isAutofill() && form.pass.value.length !== 0) {
                continue;
            }

            if (form.user) this._insertTextIntoField(form.user, this._passwordPasteRequest.getUser());
            this._insertTextIntoField(form.pass, this._passwordPasteRequest.getPassword());

            if (!this._passwordPasteRequest.isSubmit() || forms.length !== 1) continue;
            if (form.submit) {
                this._simulateClick(form.submit);
            } else if (form.secure) {
                this._simulateEnter(form.pass);
            }
        }

        return true;
    }
}