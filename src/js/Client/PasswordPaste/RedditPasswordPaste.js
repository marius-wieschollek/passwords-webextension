import AbstractPasswordPaste from "@js/Client/PasswordPaste/AbstractPasswordPaste";

export default class RedditPasswordPaste extends AbstractPasswordPaste {

    #loginUsernameSelector = '#login-username';
    #loginPasswordSelector = '#login-password';
    #loginButtonSelector = '#login-button';

    canHandle() {
        return location.origin === 'https://www.reddit.com' &&
               (
                   document.querySelector(this.#loginButtonSelector) !== null ||
                   document.querySelector(this.#loginUsernameSelector) !== null
               );
    }

    async handle() {
        let userInput = document.querySelector(this.#loginUsernameSelector);
        if(userInput === null) {
            if(this._passwordPasteRequest.isAutofill()) {
                return false;
            }

            let loginButton = document.querySelector(this.#loginButtonSelector);
            if(loginButton === null) {
                return false;
            }
            this._simulateClick(loginButton);
            try {
                userInput = await this._waitForElement(this.#loginUsernameSelector, 10000);
            } catch(e) {
                return false;
            }
        }

        this._insertTextIntoField(userInput?.shadowRoot.querySelector('input'), this._passwordPasteRequest.getUser());
        let passwordInput = document.querySelector(this.#loginPasswordSelector)?.shadowRoot.querySelector('input');
        this._insertTextIntoField(passwordInput, this._passwordPasteRequest.getPassword());
        if(!this._passwordPasteRequest.isAutofill() && this._passwordPasteRequest.isSubmit()) {
            await this._wait(500);
            // Something in reddits own code seems to reset the value of the field to a previous state in some cases
            this._insertTextIntoField(passwordInput, this._passwordPasteRequest.getPassword());
            this._simulateEnter(passwordInput);
        }

        return true;
    }
}