import AbstractPasswordPaste from "@js/Client/PasswordPaste/AbstractPasswordPaste";

export default class IBMPasswordPaste extends AbstractPasswordPaste {

    canHandle() {
        return location.origin === 'https://login.ibm.com';
    }

    async handle() {
        let userField = document.querySelector('input[id="username"]');
        // return false if the field is not existing or not visible
        if(!userField || !userField?.checkVisibility()) {
            return false;
        }
        this._insertTextIntoField(userField, this._passwordPasteRequest.getUser());

        let continueButton = await this._waitForElement('button[id="continue-button"]');
        this._simulateClick(continueButton);

        let passwordField = await this._waitForElement('input[id="password"]');
        if(!passwordField || !passwordField?.checkVisibility()) {
            return false;
        }
        this._insertTextIntoField(passwordField, this._passwordPasteRequest.getPassword());

        if(this._passwordPasteRequest.isSubmit()) {
            let signInButton = await this._waitForElement('button[id="signingbutton"]')
            this._simulateClick(signInButton)
        }

        return true;
    }
}