import FormService from '@js/Services/FormService';
import MessageService from '@js/Services/MessageService';

export default class DomMiner {

    init() {
        window.addEventListener(
            'beforeunload',
            () => {
                this._checkForNewPassword();
            }
        );
    }

    _checkForNewPassword() {
        let forms = new FormService().getLoginFields();
        for(let form of forms) {
            if(form.pass.value.length !== 0) {
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
    }

    /**
     *
     * @return {string}
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
     * @return {string}
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
     * @param {string} selector
     * @return {(string|null)}
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
     * @return {(string|null)}
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