import AbstractController from '@js/Controller/AbstractController';
import ErrorManager from "@js/Manager/ErrorManager";
import GenericPasswordPaste from "@js/Client/PasswordPaste/GenericPasswordPaste";
import TwitterPasswordPaste from "@js/Client/PasswordPaste/TwitterPasswordPaste";
import RedditPasswordPaste from "@js/Client/PasswordPaste/RedditPasswordPaste";
import TumblrPasswordPaste from "@js/Client/PasswordPaste/TumblrPasswordPaste";
import AliExpressPasswordPaste from "@js/Client/PasswordPaste/AliExpressPasswordPaste";
import BooleanState from "passwords-client/boolean-state";
import GrowattPasswordPaste from "@js/Client/PasswordPaste/GrowattPasswordPaste";

export default class FillPassword extends AbstractController {

    static isActive = new BooleanState(false);

    /**
     *
     * @param {Message} message
     * @param {Message} reply
     */
    async execute(message, reply) {
        if(FillPassword.isActive.get()) return;
        FillPassword.isActive.set(true);

        try {
            let result = await this._fillPassword(message.getPayload());

            if(result) reply.setPayload(true);
        } catch(e) {
            ErrorManager.logError(e);
        } finally {
            setTimeout(
                () => {FillPassword.isActive.set(false);},
                250
            );
        }
    }

    /**
     *
     * @param {PasswordPasteRequest} request
     */
    async _fillPassword(request) {
        let helpers = this._getPasswordPasteHelper(request);

        for(let helper of helpers) {
            if(await this._tryFill(helper)) {
                return true;
            }
        }
        return false;
    }

    /**
     *
     * @param {PasswordPasteRequest} request
     */
    _getPasswordPasteHelper(request) {
        return [
            new TwitterPasswordPaste(request),
            new RedditPasswordPaste(request),
            new TumblrPasswordPaste(request),
            new AliExpressPasswordPaste(request),
            new GrowattPasswordPaste(request),
            new GenericPasswordPaste(request)
        ];
    }

    /**
     *
     * @param {AbstractPasswordPaste} helper
     * @return {Promise<Boolean>}
     * @private
     */
    async _tryFill(helper) {
        try {
            return helper.canHandle() && await helper.handle();
        } catch(e) {
            ErrorManager.logError(e);
            return false;
        }
    }
}