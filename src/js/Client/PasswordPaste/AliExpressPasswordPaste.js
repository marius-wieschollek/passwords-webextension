import AbstractPasswordPaste from "@js/Client/PasswordPaste/AbstractPasswordPaste";

export default class AliExpressPasswordPaste extends AbstractPasswordPaste {

    canHandle() {
        return location.origin.endsWith('aliexpress.com');
    }

    async handle() {
        let {userField, passwordField} = this._getLoginFields();

        if(!userField || !passwordField) {
            if(this._passwordPasteRequest.isAutofill() || !(await this._openLoginForm())) {
                return false;
            }
            let fields = this._getLoginFields();
            userField = fields.userField;
            passwordField = fields.passwordField;
        }

        this._insertTextIntoField(userField, this._passwordPasteRequest.getUser());
        this._insertTextIntoField(passwordField, this._passwordPasteRequest.getPassword());

        if(!this._passwordPasteRequest.isAutofill() && this._passwordPasteRequest.isSubmit()) {
            let submitButton = document.querySelector('button.login-submit[type="submit"]');
            if(submitButton) {
                this._simulateClick(submitButton);
            }
        }

        return true;
    }

    _getLoginFields() {
        let userField     = document.getElementById('fm-login-id'),
            passwordField = document.getElementById('fm-login-password');
        return {userField, passwordField};
    }

    async _openLoginForm() {
        try {
            let loginMenu = await this._waitForElement('div[class^="my-account--menuItem"]');
            this._simulateMouseMove(loginMenu);
        } catch(e) {
            return false;
        }

        let loginButton;
        try {
            loginButton = await this._waitForElement('button[class^="my-account--signin"]');
        } catch(e) {
            return false;
        }

        this._simulateClick(loginButton);
        try {
            await this._waitForElement('#fm-login-id');
            return true;
        } catch(e) {
            return false;
        }
    }
}