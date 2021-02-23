import ErrorManager from '@js/Manager/ErrorManager';
import SettingsService from '@js/Services/SettingsService';
import SystemService from '@js/Services/SystemService';

class ClipboardManager {

    /**
     *
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
     */
    async getReadPermissions() {
        try {
            return await SystemService.getBrowserApi().permissions.contains({
                permissions: ["clipboardRead"] 
            });
        } catch (e) {
            ErrorManager.logError(e, "ClipboardManager.getReadPermission()");
        }
    }

    /**
     *
     * @return {String}
     */
    async readText() {
        try {
            if(await SystemService.getBrowserApi().extension.getBackgroundPage() !== window) {
                var permissions = await this.requestReadPermission();
            }
            if(permissions === true || await this.getReadPermissions()) {
                var element = this._createDOMElement();
                var result = await navigator.clipboard.readText();
                this._removeDOMElement(element);
                return result;
            }
        } catch (e) {
            ErrorManager.logError(e, "ClipboardManager.readText()");
        }
    }

    /**
     *
     * @param {String} type
     * @param {String} value
     */
    write(type, value) {
        if(type === "password") {
            this.writePassword(value);
        }
        else {
            this.writeText(value);
        }
    } 

    /**
     *
     * @param {String} value
     * @param {String} type
     */
    writeText(value) {
        try {
            var element = this._createDOMElement(value);
            navigator.clipboard.writeText(element.value);
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
        if(await SettingsService.getValue('clipboard.clear.passwords') == true) {
            setTimeout(async () => {
                var current = await this.readText();
                if(current === undefined || current === value) {
                    this.writeText(" ");
                }
            }, Number(await SettingsService.getValue('clipboard.clear.delay')) * 1000)
        }
    }   

    /**
     *
     * @param {String} type
     */
    _createDOMElement(value = "", type = "text") {
        var element = document.createElement("INPUT");
        element.setAttribute("type", type);
        element.setAttribute("value", value);
        element.readOnly = true;
        document.body.appendChild(element);
        element.select();
        return element;
    }

    /**
     *
     * @param {String} type
     */
    _removeDOMElement(element) {
        element.blur();
        document.body.removeChild(element);
    }
}

export default new ClipboardManager();