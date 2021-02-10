import SystemService from "@js/Services/SystemService";
import RecommendationManager from "@js/Manager/RecommendationManager";

export default new class BasicAuthAutofillManager {

    /**
     *
     */
    constructor() {
        this._pendingRequests = [];
    }

    /**
     *
     */
    init() {
        let api = SystemService.getBrowserApi();

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
     * @return {{authCredentials: {password: String, username: String}}}
     * @private
     */
    _provideAuthData(requestDetails) {
        let recommendations = RecommendationManager.getRecommendationsByUrl(`https://${requestDetails.challenger.host}`, requestDetails.incognito);

        if(recommendations.length !== 0 && this._pendingRequests.indexOf(requestDetails.requestId) === -1) {
            this._pendingRequests.push(requestDetails.requestId);
            let recommendation  = recommendations[0];

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