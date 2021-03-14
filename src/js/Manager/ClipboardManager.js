import ErrorManager from '@js/Manager/ErrorManager';
import SettingsService from '@js/Services/SettingsService';
import SystemService from '@js/Services/SystemService';

class ClipboardManager {

    /**
     *
     * @return {Boolean}
     */
    async requestReadPermission() {
        try {
            return await SystemService.getBrowserApi().permissions.request({
                permissions: ["clipboardRead"] 
            });
        } catch (e) {
            ErrorManager.logError(e, "ClipboardManager.getReadPermission()");
        }
    }

    /**
     *
     * @return {Boolean}
     */
    async getReadPermissions() {
        try {
            return await SystemService.getBrowserApi().permissions.contains({
                permissions: ["clipboardRead"] 
            });
        } catch (e) {
            ErrorManager.logError(e, "ClipboardManager.getReadPermission()");
            return  false;
        }
    }

    /**
     *
     * @return {String}
     */
    async readText() {
        try {
            let permissions = false
            if(await SystemService.getBrowserApi().extension.getBackgroundPage() !== window) {
                permissions = await this.requestReadPermission();
            }
            if(permissions === true || await this.getReadPermissions()) {
                let element = this._createDOMElement();
                await document.execCommand('paste');
                let result = element.value;
                this._removeDOMElement(element);
                return result;
            }
        } catch (e) {
            ErrorManager.logError(e, 'ClipboardManager.readText()');
        }
    }

    /**
     *
     * @param {String} type
     * @param {String} value
     */
    write(type, value) {
        if(type === 'password') {
            this.writePassword(value);
        }
        else {
            this.writeText(value);
        }
    } 

    /**
     *
     * @param {String} value
     */
    writeText(value) {
        try {
            let element = this._createDOMElement(value);
            document.execCommand('copy', false, element.value);
            this._removeDOMElement(element);
        } catch (e) {
            ErrorManager.logError(e);
        }
    }    

    /**
     *
     * @param {String} value
     */
    async writePassword(value) {
        this.writeText(value);
        if(await SettingsService.getValue('clipboard.clear.passwords') === true) {
            setTimeout(async () => {
                let current = await this.readText();
                if(current === undefined || current === '' || current === value) {
                    this.writeText(' ');
                }
            }, Number(await SettingsService.getValue('clipboard.clear.delay')) * 1000)
        }
    }   

    /**
     *
     * @param {String} value
     * @param {String} type
     */
    _createDOMElement(value = '', type = 'text') {
        let element = document.createElement('INPUT');
        element.setAttribute('type', type);
        element.setAttribute('value', value);
        document.body.appendChild(element);
        element.select();
        return element;
    }

    /**
     *
     * @param {Element} element
     */
    _removeDOMElement(element) {
        element.blur();
        document.body.removeChild(element);
    }
}

export default new ClipboardManager();