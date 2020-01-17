import uuid from 'uuidv4';

export default class Message {

    /**
     *
     * @param {Object} [data={}]
     */
    constructor(data = {}) {
        this._id = data.hasOwnProperty('id') ? data.id:uuid();
        this._tab = data.hasOwnProperty('tab') ? data.tab:null;
        this._type = data.hasOwnProperty('type') ? data.type:null;
        this._reply = data.hasOwnProperty('reply') ? data.reply:null;
        this._sender = data.hasOwnProperty('sender') ? data.sender:null;
        this._channel = data.hasOwnProperty('channel') ? data.channel:'runtime';
        this._payload = data.hasOwnProperty('payload') ? data.payload:null;
        this._receiver = data.hasOwnProperty('receiver') ? data.receiver:null;
    }

    /**
     *
     * @returns {String}
     */
    getId() {
        return this._id;
    }

    /**
     *
     * @param {String} value
     * @returns {Message}
     */
    setId(value) {
        this._id = value;

        return this;
    }

    /**
     *
     * @returns {(String|null)}
     */
    getType() {
        return this._type;
    }

    /**
     *
     * @param {(String|null)} value
     * @returns {Message}
     */
    setType(value) {
        this._type = value;

        return this;
    }

    /**
     *
     * @returns {(Number|null)}
     */
    getTab() {
        return this._tab;
    }

    /**
     *
     * @param {(Number|null)} value
     * @returns {Message}
     */
    setTab(value) {
        this._tab = value;

        return this;
    }

    /**
     *
     * @returns {(String|null)}
     */
    getReceiver() {
        return this._receiver;
    }

    /**
     *
     * @param {(String|null)} value
     * @returns {Message}
     */
    setReceiver(value) {
        this._receiver = value;

        return this;
    }

    /**
     *
     * @returns {(String|null)}
     */
    getSender() {
        return this._sender;
    }

    /**
     *
     * @param {(String|null)} value
     * @returns {Message}
     */
    setSender(value) {
        this._sender = value;

        return this;
    }

    /**
     *
     * @returns {(String|null)}
     */
    getReply() {
        return this._reply;
    }

    /**
     *
     * @param {(String|null)} value
     * @returns {Message}
     */
    setReply(value) {
        this._reply = value;

        return this;
    }

    /**
     *
     * @returns {(String|null)}
     */
    getChannel() {
        return this._channel;
    }

    /**
     *
     * @param {(String|null)} value
     * @returns {Message}
     */
    setChannel(value) {
        this._channel = value;

        return this;
    }

    /**
     *
     * @returns {(Object|*|null)}
     */
    getPayload() {
        return this._payload;
    }

    /**
     *
     * @param {(Object|*|null)} value
     * @returns {Message}
     */
    setPayload(value) {
        this._payload = value;

        return this;
    }

    /**
     *
     * @returns {Object}
     */
    export() {
        return {
            id      : this._id,
            tab    : this._tab,
            type    : this._type,
            reply   : this._reply,
            sender  : this._sender,
            channel : this._channel,
            payload : this._payload,
            receiver: this._receiver
        };
    }

    /**
     *
     * @returns {Object}
     */
    toJSON() {
        return this.export();
    }
}