import Password from 'passwords-client/src/Model/Password';

export default class PasswordConverter {

    /**
     *
     * @param {Message} message
     * @returns {Message}
     */
    convert(message) {
        let payload   = message.getPayload(),
            passwords = [];

        if(payload !== null) {
            for(let data of payload) {
                passwords.push(new Password(null, data));
            }
        }

        message.setPayload(passwords);

        return message;
    }
}