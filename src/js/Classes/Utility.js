export default class Utility {

    /**
     *
     * @param object
     * @returns {Array}
     */
    static objectToArray(object) {
        let array = [];
        for(let key in object) {
            if(!object.hasOwnProperty(key)) continue;
            array.push(object[key]);
        }
        return array;
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
     * @returns {Boolean}
     */
    static hostCompare(host, compare) {
        if(host === undefined || compare === undefined) return false;
        if(host === null || compare === null) return false;

        let keys  = ['www', 'login', 'signin', navigator.language],
            regex = new RegExp('^' + keys.join('\\.|^') + '\\.', 'i'),
            a     = host.replace(regex, ''),
            b     = compare.replace(regex, '');

        return a.indexOf(b) !== -1;
    }
}