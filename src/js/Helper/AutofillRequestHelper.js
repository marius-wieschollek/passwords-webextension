import PasswordPasteRequest from "@js/Models/Client/PasswordPasteRequest";

export default new class AutofillRequestHelper {

    /**
     *
     * @param {Password} password
     * @param {Boolean} submit
     * @param {Boolean} autofill
     * @returns {PasswordPasteRequest}
     */
    createPasteRequest(password, submit = true, autofill = false) {
        return new PasswordPasteRequest(
            password.getUserName(),
            password.getPassword(),
            null,
            this.getCustomFormFields(password),
            submit,
            autofill
        );
    }

    /**
     *
     * @param {Password} password
     * @returns {Array}
     */
    getCustomFormFields(password) {
        return password
            .getCustomFields()
            .getClone()
            .reduce((formFields, e) => {
                if(e.getType() === 'data' && e.getLabel().startsWith('ext:field/')) {
                    formFields.push(
                        {
                            id   : e.getLabel().replace('ext:field/', ''),
                            value: e.getValue()
                        }
                    );
                }

                return formFields;
            }, []);
    }
};