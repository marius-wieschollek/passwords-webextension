import AbstractPasswordPaste from "@js/Client/PasswordPaste/AbstractPasswordPaste";

export default class IBMCAMPasswordPaste extends AbstractPasswordPaste {

    #loginUsernameSelector = 'input[id="CAMUsername"]';
    #loginPasswordSelector = 'input[id="CAMPassword"]';
    canHandle() {
        return document.querySelector(this.#loginUsernameSelector) !== null && document.querySelector(this.#loginPasswordSelector) !== null;
    }

    async handle() {
        let userField = document.querySelector(this.#loginUsernameSelector);
        // don't fill any non-visible fields
        if(!userField.checkVisibility()) {
            return false;
        }
        this._insertTextIntoField(userField, this._passwordPasteRequest.getUser());

        let passwordField = document.querySelector(this.#loginPasswordSelector);
        if(!userField.checkVisibility()) {
            return false;
        }
        this._insertTextIntoField(passwordField, this._passwordPasteRequest.getPassword());

        if(this._passwordPasteRequest.isSubmit()) {
            let signInButton = document.querySelector('button[id="signInBtn"]')
            this._simulateClick(signInButton)
        }

        return true;
    }
}