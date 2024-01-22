import {Password} from 'passwords-client/models';

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
        if(message.getType() === 'password.suggestions') {
            this._processPasswordSuggestions(message);
        }
        if(message.getType() === 'folder.items') {
            this._processFolderItems(message);
        }

        return message;
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
    _processPasswordSuggestions(message) {
        let payload = message.getPayload();
        payload.passwords = this._convertPasswords(payload.passwords);

        message.setPayload(payload);
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