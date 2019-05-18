const NcPasswordClient = new function() {
    let isChrome = navigator.userAgent.indexOf('Chrome') !== -1;

    function getPasswordFields() {
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

    function getParentForm(el) {
        while(el.parentNode) {
            if(el.parentNode.nodeName.toLowerCase() === 'form') {
                return el.parentNode;
            }
            el = el.parentNode;
        }
    }

    function checkIfFormVisible(form) {
        let style = window.getComputedStyle(form);

        return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== 0;
    }

    function getLoginFields() {
        let fieldPairs = [],
            passwords  = getPasswordFields(),
            i          = passwords.length;

        while(i--) {
            let current = passwords[i],
                form    = getParentForm(current);
            if(form && checkIfFormVisible(form)) {
                let fields = form.getElementsByTagName('input'),
                    pair   = {form: form, pass: current};

                for(let i = 0; i < fields.length; i++) {
                    let field = fields[i];

                    if(field.readOnly || field.disabled) continue;

                    if(!pair.user && isUserNameField(field)) {
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

                pair.secure = form.method !== 'get';
                fieldPairs.push(pair);
            }
        }
        return fieldPairs;
    }

    function isUserNameField(field) {
        if(field.type === 'email') return true;

        let search = ['user', 'login', 'email'],
            name   = field.name.toLowerCase(),
            id     = field.id.toLowerCase();

        for(let i=0; i<search.length; i++) {
            if(name.indexOf(search[i]) !== -1 || id.indexOf(search[i]) !== -1) return true;
        }

        return false;
    }

    function fillPassword(user, password) {
        let forms = getLoginFields();
        for(let i = 0; i < forms.length; i++) {
            let form = forms[i];
            if(form.user) {
                form.user.value = user;
                form.user.dispatchEvent(new Event('change', {bubbles: true, cancelable: true}));
                form.user.dispatchEvent(new Event('blur', {bubbles: true, cancelable: true}));
            }

            form.pass.value = password;
            form.pass.dispatchEvent(new Event('change', {bubbles: true, cancelable: true}));
            form.pass.dispatchEvent(new Event('blur', {bubbles: true, cancelable: true}));

            if(forms.length !== 1) continue;
            if(form.submit) {
                form.submit.click();
            } else if(form.secure) {
                form.form.dispatchEvent(new Event('submit', {bubbles: true, cancelable: true}));
            }
        }
    }

    function minePassword(form) {
        let pass = form.pass.value;
        let user = '';
        if(form.user) user = form.user.value;

        if(user !== '' && pass !== '') {
            let runtime = isChrome ? chrome.runtime:browser.runtime;

            runtime.sendMessage(
                runtime.id,
                {
                    type    : 'mine-password',
                    url     : location.href,
                    user    : user,
                    password: pass
                }
            );
        }
    }

    function init() {
        if(isChrome) {
            chrome.runtime.onMessage.addListener(
                function(data, sender, response) {
                    response({ok: true});
                    fillPassword(data.user, data.password);
                }
            );
        } else {
            browser.runtime.onMessage.addListener(
                function(data) {fillPassword(data.user, data.password)}
            );
        }

        let forms = getLoginFields();
        for(let i = 0; i < forms.length; i++) {
            let current = forms[i];
            current.form.addEventListener('submit', () => { minePassword(current); });
        }
    }

    init();
};

