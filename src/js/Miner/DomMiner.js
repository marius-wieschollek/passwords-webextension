import FormService from '@js/Services/FormService';
import MessageService from '@js/Services/MessageService';

export default class DomMiner {

    /**
     *
     */
    constructor() {
        this._knownForms = [];
    }

    init() {
        window.addEventListener(
            'beforeunload',
            () => {this._checkForNewPassword();},
            {passive: true}
        );

        let forms = new FormService().getLoginFields();
        for(let form of forms) {
            if(form.form) {
                form.form.addEventListener(
                    'submit',
                    () => {this._checkFormForPassword(form);},
                    {passive: true}
                );
            }

            if(form.submit) {
                form.submit.addEventListener(
                    'click',
                    () => {this._checkFormForPassword(form);},
                    {passive: true}
                );
            }
        }
    }

    _checkForNewPassword() {
        let forms = new FormService().getLoginFields();
        for(let form of forms) {
            this._checkFormForPassword(form);
        }
        this._knownForms = [];
    }

    _checkForDuplication(form) {
        var exists = false;
        this._knownForms.forEach(element => {
            if((element.pass == form.pass.value) &&
                (element.user == form.user.value) &&
                (element.url == this._getUrl())) {
                exists = true;
            }            
        });      
        if(exists === false) {
            this._knownForms.push(
            {
                pass: form.pass.value, 
                user: form.user.value,
                url: this._getUrl()
            });  
        }
        return exists;
    }

    /**
     *
     * @param {{form: HTMLFormElement, user: HTMLInputElement, pass: HTMLInputElement}} form
     * @private
     */
    _checkFormForPassword(form) {
        if(this._checkForDuplication(form)) return;
        if(form.pass.value.length !== 0 && form.pass.value.trim().length !== 0) {
            let info = {
                url     : this._getUrl(),
                title   : this._getTitle(),
                password: {
                    selector: this._getFieldSelector(form.pass),
                    value   : form.pass.value
                }
            };

            if(form.user) {
                info.user = {
                    selector: this._getFieldSelector(form.user),
                    value   : form.user.value
                };
            }

            MessageService.send(
                {
                    type   : 'password.mine',
                    payload: info
                }
            );
        }
    }

    /**
     *
     * @return {String}
     * @private
     */
    _getUrl() {
        let canonical = document.querySelector('link[rel="canonical"]');
        if(canonical && canonical.hasAttribute('href') && canonical.getAttribute('href').length !== 0) {
            return canonical.getAttribute('href');
        }

        let ogUrl = this._checkMetaAttribute('meta[property="og:url"]');
        if(ogUrl !== null) return ogUrl;

        return location.href;
    }

    /**
     *
     * @return {String}
     * @private
     */
    _getTitle() {
        let metaAttributes = [
            'meta[name="application-name"]',
            'meta[property="al:ios:app_name"]',
            'meta[property="al:android:app_name"]',
            'meta[property="twitter:app:name:iphone"]',
            'meta[property="twitter:app:name:googleplay"]',
            'meta[property="og:site_name"]',
            'meta[name="DC.creator"]',
            'meta[name="publisher"]',
            'meta[name="msapplication-tooltip"]',
            'meta[property="og:title"]',
            'meta[name="title"]'
        ];

        for(let selector of metaAttributes) {
            let value = this._checkMetaAttribute(selector);
            if(value !== null) return value;
        }

        if(document.title && document.title.length !== 0) {
            return document.title;
        }

        return location.host;
    }

    /**
     *
     * @param {String} selector
     * @return {(String|null)}
     * @private
     */
    _checkMetaAttribute(selector) {
        let metaAttribute = document.querySelector(selector);
        if(metaAttribute && metaAttribute.hasAttribute('content') && metaAttribute.getAttribute('content').length !== 0) {
            return metaAttribute.getAttribute('content');
        }

        return null;
    }


    /**
     *
     * @param {HTMLInputElement} field
     * @return {(String|null)}
     * @private
     */
    _getFieldSelector(field) {
        if(field.id && field.id.length !== 0) {
            return '#' + field.id;
        } else if(field.name && field.name.length !== 0) {
            return '[name=' + field.name + ']';
        } else if(field.className.length !== 0) {
            return '.' + field.className.replace(' ', '.');
        }

        return null;
    }
}
