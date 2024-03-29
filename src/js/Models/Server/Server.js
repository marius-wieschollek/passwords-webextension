import {Server as ServerModel} from 'passwords-client/models';
import Properties from '@js/Definition/Server';

export default class Server extends ServerModel {

    get STATUS_UNAUTHORIZED() {
        return 'unauthorized';
    }

    get STATUS_AUTHORIZED() {
        return 'authorized';
    }

    get STATUS_DISABLED() {
        return 'disabled';
    }

    get FLAG_INCOMPATIBLE() {
        return 'flag_incompatible';
    }

    get FLAG_SOON_INCOMPATIBLE() {
        return 'flag_soon_incompatible';
    }

    constructor(data) {
        let status;
        if(data.hasOwnProperty('status')) {
            status = data.status;
            delete data.status;
        }
        super(data, Properties);
        this._status = this.STATUS_UNAUTHORIZED;
        if(status) this.setStatus(status);
    }

    getId() {
        return this.getProperty('id');
    }

    setId(value) {
        return this.setProperty('id', value);
    }

    getEnabled() {
        return this.getProperty('enabled');
    }

    setEnabled(value) {
        return this.setProperty('enabled', value);
    }

    getLabel() {
        return this.getProperty('label');
    }

    setLabel(value) {
        return this.setProperty('label', value);
    }

    getLockable() {
        return this.getProperty('lockable');
    }

    setLockable(value) {
        return this.setProperty('lockable', value);
    }

    getTimeout() {
        return this.getProperty('timeout');
    }

    setTimeout(value) {
        return this.setProperty('timeout', value);
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

    getPrivateFolder() {
        return this.getProperty('privateFolder');
    }

    setPrivateFolder(value) {
        return this.setProperty('privateFolder', value);
    }

    getInboxTag() {
        return this.getProperty('inboxTag');
    }

    setInboxTag(value) {
        return this.setProperty('inboxTag', value);
    }

    getStatus() {
        return this._status;
    }

    setStatus(value) {
        if([this.STATUS_UNAUTHORIZED, this.STATUS_AUTHORIZED, this.STATUS_DISABLED].indexOf(value) !== -1) {
            this._status = value;
        }

        return this;
    }

    getFlags() {
        return this.getProperty('flags');
    }

    setFlags(value) {
        return this.setProperty('flags', value);
    }

    addFlag(flag) {
        if(!this.hasFlag(flag)) {
            let flags = this.getFlags();
            if(!flags) flags = [];
            flags.push(flag);
            this.setFlags(flags);
        }
        return this;
    }

    removeFlag(flag) {
        if(this.hasFlag(flag)) {
            let flags = this.getFlags(),
                index = flags.indexOf(flag);
            flags.splice(index, 1);
            this.setFlags(flags);
        }
        return this;
    }

    hasFlag(flag) {
        let flags = this.getFlags();
        return Array.isArray(flags) && flags.indexOf(flag) !== -1
    }

    toJSON() {
        let object = super.toJSON();
        object.status = this._status;

        return object;
    }
}