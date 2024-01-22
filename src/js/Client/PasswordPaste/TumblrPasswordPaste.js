import AbstractPasswordPaste from "@js/Client/PasswordPaste/AbstractPasswordPaste";

export default class TumblrPasswordPaste extends AbstractPasswordPaste {

    canHandle() {
        return location.origin === 'https://www.tumblr.com' &&
            !this._passwordPasteRequest.isAutofill();
    }

    async handle() {
        let emailField = document.querySelector('input[name="email"]');
        if(!emailField) {
            let loginButton = document.querySelector('button.TwoER, button.CxLjL');
            this._simulateClick(loginButton);

            try {
                let continueButton = await this._waitForElement('button.dKGjO');
                this._simulateClick(continueButton);
                emailField = await this._waitForElement('input[name="email"]');
            } catch (e) {
                return false;
            }
        }

        this._insertTextIntoField(emailField, this._passwordPasteRequest.getUser());
        this._simulateEnter(emailField);
        let passwordField = await this._waitForElement('input[name="password"]');
        this._insertTextIntoField(passwordField, this._passwordPasteRequest.getPassword());

        if(this._passwordPasteRequest.isSubmit()) {
            this._simulateEnter(passwordField);
        }

        return true;
    }
}