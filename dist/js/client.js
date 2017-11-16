function getLoginFields() {
    let fieldPairs    = [],
        // All password fields
        passwords     = (function () {
            let fields  = document.getElementsByTagName("input"),
                results = [],
                i       = fields.length;
            while (i--) {
                if (fields[i].type === "password") {
                    results.push(fields[i]);
                }
            }
            return results;
        }()),
        // Get parent form function
        getParentForm = function (el) {
            while (el.parentNode) {
                if (el.parentNode.nodeName.toLowerCase() === "form") {
                    return el.parentNode;
                }
                el = el.parentNode;
            }
        },
        j             = passwords.length;

    while (j--) {
        let current = passwords[j],
            form    = getParentForm(current);
        if (form) {
            let fields = form.getElementsByTagName("input");
            for (let i = 0; i < fields.length; i++) {
                if (fields[i] !== current && (fields[i].type === "text" || fields[i].type === "email")) {
                    fieldPairs[fieldPairs.length] = [fields[i], current];
                    break;
                }
            }
        }
    }
    return fieldPairs;
}

function fillPassword(user, password) {
    let fields = getLoginFields();
    for (let i = 0; i < fields.length; i++) {
        fields[i][0].value = user;
        fields[i][1].value = password;
    }
}

browser.runtime.onMessage.addListener(
    function (data) { fillPassword(data.user, data.password) }
);