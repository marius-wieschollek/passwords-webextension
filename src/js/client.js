const NcPasswordClient = new function () {
    let isChrome = navigator.userAgent.indexOf('Chrome') !== -1;
    const extensionId = 'iekefncfcnkpjkldggojdaaeeempljfa';

    function getPasswordFields() {
        let fields  = document.getElementsByTagName('input'),
            results = [],
            i       = fields.length;
        while (i--) {
            if (fields[i].type === 'password') {
                results.push(fields[i]);
            }
        }
        return results;
    }

    function getParentForm(el) {
        while (el.parentNode) {
            if (el.parentNode.nodeName.toLowerCase() === 'form') {
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

        while (i--) {
            let current = passwords[i],
                form    = getParentForm(current);
            if (form && checkIfFormVisible(form)) {
                let fields = form.getElementsByTagName('input'),
                    pair   = {form: form, pass: current};

                for (let i = 0; i < fields.length; i++) {
                    let field = fields[i];
                    if (!pair.user && (field.type === 'text' || field.type === 'email')) {
                        pair.user = field;
                    } else if (!pair.submit && field.type === 'submit') {
                        pair.submit = field;
                    } else if (!pair.user && field.type === 'tel') {
                        pair.tel = field;
                    }
                }

                if (!pair.user && pair.tel) pair.user = pair.tel;

                fieldPairs.push(pair);
            }
        }
        return fieldPairs;
    }

    function fillPassword(user, password) {
        let forms = getLoginFields();
        for (let i = 0; i < forms.length; i++) {
            let form = forms[i];
            if (form.user) form.user.value = user;
            form.pass.value = password;

            if (forms.length !== 1) continue;
            if (form.submit) {
                form.submit.click();
            } else {
                form.form.dispatchEvent(new Event('submit', {bubbles: true, cancelable: true}));
            }
        }
    }

    function minePassword(form) {
        let pass = form.pass.value;
        let user = '';
        if (form.user) user = form.user.value;

        if (user !== '' && pass !== '') {
            if (isChrome) {
                chrome.runtime.sendMessage(
                    extensionId,
                    {
                        type    : 'mine-password',
                        url     : location.href,
                        user    : user,
                        password: pass
                    }
                );
            } else {
                browser.runtime.sendMessage(
                    'ncpasswords@mdns.eu',
                    {
                        type    : 'mine-password',
                        url     : location.href,
                        user    : user,
                        password: pass
                    }
                )
            }
        }
    }

    function init() {
        if (isChrome) {
            chrome.runtime.onMessage.addListener(
                function (data, sender, response) {
                    response({ok: true});
                    fillPassword(data.user, data.password);
                }
            );
        } else {
            browser.runtime.onMessage.addListener(
                function (data) {fillPassword(data.user, data.password)}
            );
        }

        let forms = getLoginFields();
        for (let i = 0; i < forms.length; i++) {
            let current = forms[i];
            current.form.addEventListener('submit', () => { minePassword(current); });
        }
    }

    init();
};

