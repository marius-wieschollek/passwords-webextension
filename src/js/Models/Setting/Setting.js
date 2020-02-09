import ApiSetting from 'passwords-client/src/Model/Setting/Setting';
import InvalidScopeError from 'passwords-client/src/Exception/InvalidScopeError';

export default class Setting extends ApiSetting {

    /**
     * @return {String}
     */
    static get SCOPE_LOCAL() {
        return 'local';
    }

    /**
     * @return {String}
     */
    static get SCOPE_SYNC() {
        return 'sync';
    }

    /**
     * @return {String[]}
     */
    static get SCOPES() {
        return [
            this.SCOPE_USER,
            this.SCOPE_SYNC,
            this.SCOPE_LOCAL,
            this.SCOPE_SERVER,
            this.SCOPE_CLIENT
        ];
    }

    /**
     * @param {String} scope
     * @private
     */
    _checkScope(scope) {
        if(Setting.SCOPES.indexOf(scope) === -1) {
            throw new InvalidScopeError(scope);
        }
    }
}