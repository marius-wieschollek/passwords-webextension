export default class PasswordPasteRequest {
    _user;
    _password;
    _email;
    _formFields;
    _submit;
    _autofill;

    constructor(user, password, email, formFields, submit, autofill = false) {
        this._user = user;
        this._password = password;
        this._email = email;
        this._formFields = formFields;
        this._submit = submit;
        this._autofill = autofill;
    }

    getUser() {
        return this._user;
    }

    getPassword() {
        return this._password;
    }

    getEmail() {
        return this._email;
    }

    getFormFields() {
        return this._formFields;
    }

    isSubmit() {
        return this._submit;
    }

    isAutofill() {
        return this._autofill;
    }

    toJSON() {
        return {
            user      : this._user,
            password  : this._password,
            email     : this._email,
            formFields: this._formFields,
            submit    : this._submit,
            autofill  : this._autofill
        };
    }
}