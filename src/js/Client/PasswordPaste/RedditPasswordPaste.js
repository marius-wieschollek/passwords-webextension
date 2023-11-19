import AbstractPasswordPaste from "@js/Client/PasswordPaste/AbstractPasswordPaste";

export default class RedditPasswordPaste extends AbstractPasswordPaste {

    canHandle() {
        return location.origin === 'https://www.reddit.com' &&
            (
                document.getElementById('login-button') !== null ||
                document.getElementById('login-username') !== null
            );
    }

    async handle() {
        let userInput = document.getElementById('login-username');
        if (userInput === null) {
            if (this._passwordPasteRequest.isAutofill()) {
                return false;
            }

            let loginButton = document.getElementById('login-button');
            if (loginButton === null) {
                return false;
            }
            this._simulateClick(loginButton);
            try {
                userInput = await this._waitForElement('#login-username', 10000);
            } catch (e) {
                return false;
            }
        }

        this._insertTextIntoField(userInput, this._passwordPasteRequest.getUser());
        let passwordInput = document.getElementById('login-password');
        this._insertTextIntoField(passwordInput, this._passwordPasteRequest.getPassword());
        if (!this._passwordPasteRequest.isAutofill()) {
            await this._wait(500);
            this._simulateEnter(passwordInput);
        }

        return true;
    }
}