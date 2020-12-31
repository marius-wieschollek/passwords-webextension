import FeedbackItem from '@js/Models/Queue/FeedbackItem';

export default class AuthorisationItem extends FeedbackItem {

    /**
     *
     * @returns {String}
     */
    getServerId() {
        return this.getTask().server;
    }

    /**
     *
     * @returns {String}
     */
    getLabel() {
        return this.getTask().label;
    }

    /**
     *
     * @returns {Boolean}
     */
    requiresPassword() {
        return this.getTask().password;
    }

    /**
     *
     * @returns {Boolean}
     */
    requiresToken() {
        return this.getTask().token;
    }

    /**
     *
     * @returns {Object[]}
     */
    getProviders() {
        return this.getTask().providers;
    }

    /**
     *
     * @param value
     * @returns {AuthorisationItem}
     */
    setPassword(value) {
        let result = this.getResult();
        result.password = value;
        this.setResult(result);

        return this;
    }

    /**
     *
     * @returns {*}
     */
    getPassword() {
        let result = this.getResult();

        return result.hasOwnProperty('password') ? result.password:null;
    }

    /**
     *
     * @param value
     * @returns {AuthorisationItem}
     */
    setToken(value) {
        let result = this.getResult();
        result.token = value;
        this.setResult(result);

        return this;
    }

    /**
     *
     * @returns {*}
     */
    getToken() {
        let result = this.getResult();

        return result.hasOwnProperty('token') ? result.token:null;
    }

    /**
     *
     * @param value
     * @returns {AuthorisationItem}
     */
    setProvider(value) {
        let result = this.getResult();
        result.provider = value;
        this.setResult(result);

        return this;
    }

    /**
     *
     * @returns {*}
     */
    getProvider() {
        let result = this.getResult();

        return result.hasOwnProperty('provider') ? result.provider:null;
    }
}