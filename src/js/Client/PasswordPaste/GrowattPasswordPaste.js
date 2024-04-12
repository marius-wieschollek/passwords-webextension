import AbstractPasswordPaste from "@js/Client/PasswordPaste/AbstractPasswordPaste";

export default class GrowattPasswordPaste extends AbstractPasswordPaste {

    canHandle() {
        return location.origin === 'https://server.growatt.com';
    }

    async handle() {
        let userField = document.querySelector('input#val_loginAccount');
        if(!userField) {
            return false;
        }

        this._insertTextIntoField(userField, this._passwordPasteRequest.getUser());
        let passwordField = await this._waitForElement('input#val_loginPwd');
        this._insertTextIntoField(passwordField, this._passwordPasteRequest.getPassword());

        if(this._passwordPasteRequest.isSubmit()) {
            this._simulateEnter(passwordField);
        }

        return true;
    }
}