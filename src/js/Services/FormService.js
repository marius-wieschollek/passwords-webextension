export default class FormService {

    getPasswordFields() {
        let fields  = document.getElementsByTagName('input'),
            results = [],
            i       = fields.length;
        while(i--) {
            if(fields[i].type === 'password') {
                results.push(fields[i]);
            }
        }
        return results;
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
                let fields = form.getElementsByTagName('input'),
                    pair   = {form: form, pass: current};

                for(let i = 0; i < fields.length; i++) {
                    let field = fields[i];

                    if(!this.isQualifiedField(field)) continue;

                    if(!pair.user && this.isUserNameField(field)) {
                        pair.user = field;
                    } else if(!pair.firstGuess && field.type === 'text' && (field.autofocus || field.required)) {
                        pair.firstGuess = field;
                    } else if(!pair.secondGuess && field.type === 'text') {
                        pair.secondGuess = field;
                    } else if(!pair.submit && field.type === 'submit') {
                        pair.submit = field;
                    } else if(!pair.user && field.type === 'tel') {
                        pair.tel = field;
                    }
                }

                if(!pair.user && pair.tel) pair.user = pair.tel;
                if(!pair.user && pair.firstGuess) pair.user = pair.firstGuess;
                if(!pair.user && pair.secondGuess) pair.user = pair.secondGuess;

                if(!pair.submit && form.id) {
                    let submit = document.querySelector(`button[form="${form.id}"][type=submit], input[form="${form.id}"][type=submit]`);
                    if(submit) pair.submit = submit;
                }

                pair.secure = form.method !== 'get';
                fieldPairs.push(pair);
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
        return !field.readOnly && !field.disabled && ['text', 'email', 'tel', 'submit'].indexOf(field.type) !== -1;
    }

    /**
     *
     * @param {HTMLInputElement} field
     * @return {Boolean}
     */
    isUserNameField(field) {
        if(field.type === 'email') return true;

        let search = ['user', 'login', 'email'],
            pl     = field.placeholder.toLowerCase(),
            name   = field.name.toLowerCase(),
            id     = field.id.toLowerCase();

        for(let i = 0; i < search.length; i++) {
            if(name.indexOf(search[i]) !== -1 || id.indexOf(search[i]) !== -1 || pl.indexOf(search[i]) !== -1) return true;
        }

        return false;
    }
}