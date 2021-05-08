export default class FormService {

    getPasswordFields(rootNode = document) {
        if(!rootNode || rootNode.querySelectorAll) return [];
        let fields         = rootNode.querySelectorAll('input[type="password"]'),
            excludes       = ['fake', 'hidden'],
            passwordFields = [];

        loop: for(let field of fields) {
            let pl   = field.placeholder.toLowerCase(),
                name = field.name.toLowerCase(),
                id   = field.id.toLowerCase();

            for(let exclude of excludes) {
                if(name.indexOf(exclude) !== -1 || id.indexOf(exclude) !== -1 || pl.indexOf(exclude) !== -1) continue loop;
            }

            passwordFields.push(field);
        }

        return passwordFields;
    }

    /**
     *
     * @param {Node} el
     * @return {(HTMLFormElement|void)}
     */
    getParentForm(el) {
        while(el.parentNode) {
            if(el.parentNode.nodeName.toLowerCase() === 'form') {
                return el.parentNode;
            }
            el = el.parentNode;
        }
    }

    /**
     *
     * @param form
     * @return {Boolean}
     */
    checkIfFormVisible(form) {
        let style = window.getComputedStyle(form);

        return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
    }

    /**
     *
     * @return {[]}
     */
    getLoginFields() {
        let fieldPairs = [],
            passwords  = this.getPasswordFields(),
            i          = passwords.length;

        while(i--) {
            let current = passwords[i],
                form    = this.getParentForm(current);
            if(form && this.checkIfFormVisible(form)) {
                let fields        = form.querySelectorAll('input, button'),
                    lastUserGuess = null,
                    pair          = {form: form, pass: current};

                for(let i = 0; i < fields.length; i++) {
                    let field = fields[i];

                    if(field === current && lastUserGuess !== null) {
                        pair.firstGuess = lastUserGuess;
                    }

                    if(!this.isQualifiedField(field)) continue;

                    lastUserGuess = null;
                    if(!pair.user && this.isUserNameField(field)) {
                        pair.user = field;
                    } else if(field.type === 'text') {
                        if((field.autofocus || field.required)) {
                            if(!pair.firstGuess) {
                                pair.firstGuess = field;
                            } else {
                                lastUserGuess = field;
                                if(!pair.secondGuess) pair.secondGuess = field;
                            }
                        } else {
                            if(!pair.secondGuess) pair.secondGuess = field;
                            lastUserGuess = field;
                        }
                    } else if(!pair.submit && this.isSubmitButton(field)) {
                        pair.submit = field;
                    } else if(!pair.tel && field.type === 'tel') {
                        pair.tel = field;
                    } else if(!pair.email && field.type === 'email') {
                        pair.email = field;
                    } else if(!pair.remember && this.isRememberField(field)) {
                        pair.remember = field;
                    }
                }

                if(!pair.user && pair.email) pair.user = pair.email;
                if(!pair.user && pair.tel) pair.user = pair.tel;
                if(!pair.user && pair.firstGuess) pair.user = pair.firstGuess;
                if(!pair.user && pair.secondGuess) pair.user = pair.secondGuess;

                if(!pair.submit) {
                    pair.submit = form.querySelector('button[type="submit"]');
                }
                if(!pair.submit && form.id) {
                    let submit = document.querySelector(`button[form="${form.id}"][type=submit], input[form="${form.id}"][type=submit]`);
                    if(submit) pair.submit = submit;
                }

                pair.secure = form.method !== 'get';
                fieldPairs.push(pair);
            } else {
                fieldPairs.push({secure: false, pass: current});
            }
        }

        return fieldPairs;
    }

    /**
     *
     * @param {HTMLInputElement} field
     * @return {Boolean}
     */
    isQualifiedField(field) {
        return !field.readOnly && !field.disabled && ['text', 'email', 'tel', 'submit', 'button', 'checkbox'].indexOf(field.type) !== -1;
    }

    /**
     *
     * @param {HTMLInputElement} field
     * @return {Boolean}
     */
    isUserNameField(field) {
        if(['checkbox', 'submit', 'button'].indexOf(field.type) !== -1) return false;
        if(field.type === 'email') return true;

        let includes = ['user', 'login', 'email'],
            excludes = ['fake', 'hidden'],
            pl       = field.placeholder.toLowerCase(),
            name     = field.name.toLowerCase(),
            id       = field.id.toLowerCase();

        for(let exclude of excludes) {
            if(name.indexOf(exclude) !== -1 || id.indexOf(exclude) !== -1 || pl.indexOf(exclude) !== -1) return false;
        }

        for(let include of includes) {
            if(name.indexOf(include) !== -1 || id.indexOf(include) !== -1 || pl.indexOf(include) !== -1) return true;
        }

        return false;
    }

    /**
     * @param {HTMLInputElement} field
     * @return {Boolean}
     */
    isRememberField(field) {
        if(field.type !== 'checkbox') return false;

        let includes = ['remember', 'autologin', 'permanent'],
            name     = field.name.toLowerCase(),
            id       = field.id.toLowerCase();

        for(let include of includes) {
            if(name.indexOf(include) !== -1 || id.indexOf(include) !== -1) return true;
        }

        return false;
    }

    /**
     * @param {HTMLInputElement} field
     * @return {Boolean}
     */
    isSubmitButton(field) {
        if(field.type === 'submit') return true;
        if(field.type !== 'button') return false;

        let includes = ['submit', 'login'],
            name     = field.name.toLowerCase(),
            id       = field.id.toLowerCase();

        for(let include of includes) {
            if(name.indexOf(include) !== -1 || id.indexOf(include) !== -1) return true;
        }

        return false;
    }
}