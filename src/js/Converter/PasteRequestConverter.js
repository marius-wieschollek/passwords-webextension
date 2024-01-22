import PasswordPasteRequest from "@js/Models/Client/PasswordPasteRequest";

export default class PasteRequestConverter {

    /**
     *
     * @param {Message} message
     * @returns {Message}
     */
    convert(message) {
        if (message.getType() === 'autofill.password') {
            this._convertPasteRequestItem(message);
        }

        return message;
    }

    /**
     *
     * @param {Message} message
     * @return {Password[]}
     * @private
     */
    _convertPasteRequestItem(message) {
        let payload = message.getPayload();
        message.setPayload(
            new PasswordPasteRequest(
                payload.user,
                payload.password,
                payload.email,
                payload.formFields,
                payload.submit,
                payload.autofill
            )
        );
    }
}