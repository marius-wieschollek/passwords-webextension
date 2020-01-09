import Password from 'passwords-client/src/Model/Password';

export default class PasswordConverter {

    /**
     *
     * @param {Message} message
     * @returns {Message}
     */
    convert(message) {
        if(message.getType() === 'password.items') {
            this._processPasswordItems(message)
        }
        if(message.getType() === 'popup.data') {
            this._processPopopData(message)
        }

        return message;
    }

    /**
     *
     * @param {Message} message
     */
    _processPopopData(message) {
        let payload   = message.getPayload();

        if(payload.hasOwnProperty('suggested')) {
            payload.suggested = this._convertPasswords(payload.suggested);
        }
        if(payload.hasOwnProperty('search') && payload.search.hasOwnProperty('results')) {
            payload.search.results = this._convertPasswords(payload.search.results);
        }

        message.setPayload(payload);
    }

    /**
     *
     * @param {Message} message
     */
    _processPasswordItems(message) {
        let payload   = message.getPayload(),
            passwords = this._convertPasswords(payload);
        message.setPayload(passwords);
    }

    /**
     *
     * @param {Array} items
     * @return {Password[]}
     * @private
     */
    _convertPasswords(items) {
        let passwords = [];

        if(items !== null) {
            for(let data of items) {
                passwords.push(new Password(null, data));
            }
        }

        return passwords;
    }
}