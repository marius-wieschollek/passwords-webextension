import AbstractPasswordPaste from "@js/Client/PasswordPaste/AbstractPasswordPaste";

export default class TwitterPasswordPaste extends AbstractPasswordPaste {

    canHandle() {
        return location.href.startsWith('https://twitter.com/') &&
            (
                (
                    !this._passwordPasteRequest.isAutofill() &&
                    document.querySelector('a[href="/login"]') !== null
                ) ||
                document.querySelector('input[autocomplete="username"]') !== null
            );
    }

    async handle() {
        let userInput;
        try {
            let time = location.href === 'https://twitter.com/i/flow/login' ? 10000:1000;
            userInput = await this._waitForElement('input[autocomplete="username"]', time);
        } catch (e) {
            if (this._passwordPasteRequest.isAutofill()) {
                return false;
            }

            let loginButton = document.querySelector('a[href="/login"]');
            if (loginButton === null) {
                return false;
            }
            this._simulateClick(loginButton);
            try {
                userInput = await this._waitForElement('input[autocomplete="username"]', 10000);
            } catch (e) {
                return false;
            }
        }


        this._insertTextIntoField(userInput, this._passwordPasteRequest.getUser());
        this._simulateEnter(userInput);

        let passwordInput = await this._waitForElement('input[name="password"]', 10000);
        this._insertTextIntoField(passwordInput, this._passwordPasteRequest.getPassword());

        if (!this._passwordPasteRequest.isAutofill() && this._passwordPasteRequest.isSubmit()) {
            this._simulateEnter(passwordInput);
        }

        return true;
    }
}