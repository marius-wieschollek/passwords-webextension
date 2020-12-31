import EventQueue from '@js/Event/EventQueue';
import ErrorManager from '@js/Manager/ErrorManager';
import SettingModel from 'passwords-client/src/Model/Setting/Setting';
import InvalidScopeError from "passwords-client/src/Exception/InvalidScopeError";

export default class Setting extends SettingModel {

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
     *
     * @returns {String[]}
     * @constructor
     */
    static get SCOPES() {
        let scopes = SettingModel.SCOPES;
        scopes.push(this.SCOPE_LOCAL);
        scopes.push(this.SCOPE_SYNC);
        return scopes;
    }

    /**
     *
     * @param value
     */
    set value(value) {
        let oldValue = this._value;
        this._value = value;

        if(oldValue === value) return;
        this._change
            .emit({value: value, name: this._name, oldValue})
            .catch(ErrorManager.catch);
    }

    /**
     *
     * @returns {EventQueue}
     */
    get change() {
        return this._change;
    }

    /**
     *
     * @param name
     * @param value
     * @param scope
     */
    constructor(name, value, scope = 'client') {
        super(name, value, scope);
        this._change = new EventQueue();
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