import ErrorManager from '@js/Manager/ErrorManager';
import SettingsService from '@js/Services/SettingsService';

class ClipboardManager {

    /**
     *
     * @return {String}
     */
    async readText() {
        try {
            var element = this._CreateDOMElement();
            await document.execCommand('paste');
            var result = element.value
            this._RemoveDOMElement(element);
            return result;
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
            var element = this._CreateDOMElement(value);
            document.execCommand('copy', false, element.value);
            this._RemoveDOMElement(element);            
        } catch (e) {
            ErrorManager.logError(e);
        }
    }    

    /**
     *
     * @param {String} value
     */
    async writePassword(value) {
        var self = this;
        this.writeText(value);
        if(await SettingsService.getValue('clipboard.clear.passwords') == true) {
            setTimeout(async function() {
                if(await self.readText() === value) {
                    self.writeText(" ");
                }
            }, Number(await SettingsService.getValue('clipboard.clear.delay')) * 1000)
        }
    }   

    /**
     *
     * @param {String} type
     */
    _CreateDOMElement(value = "", type = "text") {
        var element = document.createElement("INPUT");
        element.setAttribute("type", type);
        element.setAttribute("value", value);
        document.body.appendChild(element);
        element.select();
        return element;
    }

    /**
     *
     * @param {String} type
     */
    _RemoveDOMElement(element) {
        element.blur();
        document.body.removeChild(element);
    }
}

export default new ClipboardManager();