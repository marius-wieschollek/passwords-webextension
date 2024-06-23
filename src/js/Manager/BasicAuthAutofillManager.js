import SystemService from "@js/Services/SystemService";
import RecommendationManager from "@js/Manager/RecommendationManager";
import SettingsService from '@js/Services/SettingsService';

export default new class BasicAuthAutofillManager {

    /**
     *
     */
    constructor() {
        this._pendingRequests = [];
        this._setting = null;
    }

    /**
     *
     */
    async init() {
        if(!await SystemService.hasPermissions({permissions: ['webRequestBlocking']})) {
            return;
        }


        let api = SystemService.getBrowserApi();

        this._setting = await SettingsService.get('paste.basic-auth');

        api.webRequest.onAuthRequired.addListener(
            (d) => { return this._provideAuthData(d); },
            {urls: ['https://*/*']},
            ['blocking']
        );

        api.webRequest.onCompleted.addListener(
            (d) => { this._cleanUpRequest(d); },
            {urls: ['https://*/*']}
        );

        api.webRequest.onErrorOccurred.addListener(
            (d) => { this._cleanUpRequest(d); },
            {urls: ['https://*/*']}
        );
    }

    /**
     *
     * @param requestDetails
     * @return {(void|{authCredentials: {password: String, username: String}})}
     * @private
     */
    _provideAuthData(requestDetails) {
        if(!this._setting.getValue()) return;
        let recommendations = RecommendationManager.getSuggestionsForUrl(`https://${requestDetails.challenger.host}`, requestDetails.incognito);

        if(recommendations.length !== 0 && this._pendingRequests.indexOf(requestDetails.requestId) === -1) {
            this._pendingRequests.push(requestDetails.requestId);
            let recommendation = recommendations[0];

            return {
                authCredentials: {
                    username: recommendation.getUserName(),
                    password: recommendation.getPassword()
                }
            };
        }
    }

    /**
     *
     * @param requestDetails
     * @private
     */
    _cleanUpRequest(requestDetails) {
        let index = this._pendingRequests.indexOf(requestDetails.requestId);
        if(index > -1) this._pendingRequests.splice(index, 1);
    }
};