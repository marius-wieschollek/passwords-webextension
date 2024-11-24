import AbstractPasswordPaste from "@js/Client/PasswordPaste/AbstractPasswordPaste";

export default class BlueskyPasswordPaste extends AbstractPasswordPaste {

    canHandle() {
        return location.origin === 'https://bsky.app';
    }

    async handle() {
        if(!await this._openLoginPage()) {
            return false;
        }

        let userField = document.querySelector('input[autocomplete="username"]');
        if(!userField) {
            return false;
        }
        this._insertTextIntoField(userField, this._passwordPasteRequest.getUser());

        let passwordField = await this._waitForElement('input[autocomplete="password"]');
        this._insertTextIntoField(passwordField, this._passwordPasteRequest.getPassword());

        if(this._passwordPasteRequest.isSubmit()) {
            this._simulateEnter(passwordField);
        }

        return true;
    }

    /**
     *
     * @return {Promise<void>}
     * @private
     */
    async _navigateChooseAccountForm() {
        let chooseAccountForm = await this._waitForElement('div[data-testid="chooseAccountForm"]', 10000);
        if(chooseAccountForm) {
            let chooseAccountButton = document.querySelector('button[data-testid="chooseAddAccountBtn"]');
            if(chooseAccountButton) {
                this._simulateClick(chooseAccountButton);
            }
        }
        await this._waitForElement('input[autocomplete="username"]', 1000);
    }

    /**
     *
     * @return {Promise<boolean>}
     * @private
     */
    async _openLoginPage() {
        let userField = document.querySelector('input[autocomplete="username"]');
        if(userField) {
            await this._navigateChooseAccountForm();
            return true;
        }

        if(this._passwordPasteRequest.isAutofill()) {
            return false;
        }

        let loginButton1 = document.querySelector('button[data-testid="signInButton"]');
        if(loginButton1) {
            this._simulateClick(loginButton1);
            await this._navigateChooseAccountForm();
            return true;
        }

        let localeElement = document.querySelector('option[value="en"]');
        if(!localeElement) {
            return false;
        }

        let loginButton2 = localeElement.parentElement.parentElement.parentElement.parentElement.querySelector('div:nth-child(3) > button:nth-child(2)');
        if(loginButton2) {
            this._simulateClick(loginButton2);
            await this._navigateChooseAccountForm();
            return true;
        }

        return false;
    }
}