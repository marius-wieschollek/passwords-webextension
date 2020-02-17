import Password from 'passwords-client/src/Model/Password/Password';

export default class PasswordConverter {

    /**
     *
     * @param {Message} message
     * @returns {Message}
     */
    convert(message) {
        if(message.getType() === 'password.items') {
            this._processPasswordItems(message);
        }
        if(message.getType() === 'folder.items') {
            this._processFolderItems(message);
        }
        if(message.getType() === 'popup.data') {
            this._processPopopData(message);
        }

        return message;
    }

    /**
     *
     * @param {Message} message
     */
    _processPopopData(message) {
        let payload = message.getPayload();

        if(payload.hasOwnProperty('related') && payload.related.hasOwnProperty('suggested')) {
            payload.related.suggested = this._convertPasswords(payload.related.suggested);
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
     * @param {Message} message
     */
    _processFolderItems(message) {
        let payload = message.getPayload();
        payload.passwords = this._convertPasswords(payload.passwords);
        message.setPayload(payload);
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
                passwords.push(new Password(data));
            }
        }

        return passwords;
    }
}