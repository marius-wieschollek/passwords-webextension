import AbstractController from '@js/Controller/AbstractController';
import SearchIndex from '@js/Search/Index/SearchIndex';
import SystemService from '@js/Services/SystemService';
import ThemeService from '@js/Services/ThemeService';
import ErrorManager from "@js/Manager/ErrorManager";
import BlobToBase64Helper from "@js/Helper/BlobToBase64Helper";

export default class Favicon extends AbstractController {

    async execute(message, reply) {
        let {password, size} = message.getPayload();

        /** @type {EnhancedPassword} **/
        let model = SearchIndex.getItem(password);

        if(model !== null) {
            try {
                let blob = await model.getFavicon(size),
                    icon = await BlobToBase64Helper.convert(blob);
                reply.setPayload(icon);
            } catch(e) {
                ErrorManager.logError(e);
                reply.setPayload(await this._getDefaultIcon());
            }
        } else {
            reply.setPayload(await this._getDefaultIcon());
        }
    }

    /**
     *
     * @returns {Promise<String>}
     * @private
     */
    async _getDefaultIcon() {
        let icon = await ThemeService.getBadgeIcon();
        if(icon === null) {
            icon = await SystemService.getBrowserApi().runtime.getURL('img/passwords-new-dark.svg');
        }
        return icon;
    }

    /**
     * @param {Blob} blob
     * @returns {Promise<String>}
     * @private
     */
    async _blobToBase64(blob) {
        return new Promise((resolve, reject) => {
            let reader = new FileReader();
            reader.addEventListener('loadend', () => {
                resolve(reader.result);
            });
            reader.addEventListener('error', (e) => {
                reject(e);
            });
            reader.readAsDataURL(blob);
        });
    }
}