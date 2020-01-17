import ServerModel from 'passwords-client/src/Model/Server/Server';
import Properties from '../../Definition/Server';

export default class Server extends ServerModel {
    constructor(data) {
        super(data, Properties);
    }

    getId() {
        return this.getProperty('id');
    }

    setId(value) {
        return this.setProperty('id', value);
    }

    getLabel() {
        return this.getProperty('label');
    }

    setLabel(value) {
        return this.setProperty('label', value);
    }

    getRootFolder() {
        return this.getProperty('rootFolder');
    }

    setRootFolder(value) {
        return this.setProperty('rootFolder', value);
    }

    getInboxFolder() {
        return this.getProperty('inboxFolder');
    }

    setInboxFolder(value) {
        return this.setProperty('inboxFolder', value);
    }

    getInboxTag() {
        return this.getProperty('inboxTag');
    }

    setInboxTag(value) {
        return this.setProperty('inboxTag', value);
    }
}