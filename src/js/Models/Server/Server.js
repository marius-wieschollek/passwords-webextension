import ServerModel from 'passwords-client/src/Model/Server';
import Properties from '../../Definition/Server';

export default class Server extends ServerModel {
    constructor(data) {
        super(data, Properties);
    }

    getId() {
        return this._getProperty('id');
    }

    setId(value) {
        return this._setProperty('id', value);
    }

    getLabel() {
        return this._getProperty('label');
    }

    setLabel(value) {
        return this._setProperty('label', value);
    }

    getRootFolder() {
        return this._getProperty('rootFolder');
    }

    setRootFolder(value) {
        return this._setProperty('rootFolder', value);
    }

    getInboxFolder() {
        return this._getProperty('inboxFolder');
    }

    setInboxFolder(value) {
        return this._setProperty('inboxFolder', value);
    }

    getInboxTag() {
        return this._getProperty('inboxTag');
    }

    setInboxTag(value) {
        return this._setProperty('inboxTag', value);
    }
}