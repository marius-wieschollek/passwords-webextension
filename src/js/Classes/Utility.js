import $ from "jquery";

export default class Utility {

    /**
     *
     * @param key
     * @param variables
     * @returns {string}
     */
    static translate(key, variables = []) {
        Array.isArray(variables) ? variables.unshift(key):variables = [key];

        let translation = browser.i18n.getMessage.apply(this, variables);

        return translation ? translation:key;
    }

    /**
     *
     * @param text
     */
    static copyToClipboard(text) {
        let id       = 'ctc-' + Math.random(),
            $element = $('<textarea id="' + id + '" style="position:absolute">' + text + '</textarea>');

        $('body').append($element);
        $element.select();

        document.execCommand('copy');

        $element.remove();
    }

    /**
     *
     * @param url
     * @param property
     * @returns {Element}
     */
    static analyzeUrl(url, property = false) {
        let el = document.createElement('a');
        el.href = url;
        return property ? el[property]:el;
    }

    /**
     *
     * @param host
     * @param compare
     * @returns {boolean}
     */
    static hostCompare(host, compare) {
        let keys  = ['www', 'login', 'signin', navigator.language],
            regex = new RegExp('^' + keys.join('\\.|^') + '\\.', 'i'),
            a     = host.replace(regex, ''),
            b     = compare.replace(regex, '');

        return a.indexOf(b) !== -1;
    }
}