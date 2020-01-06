import SystemService from '@js/Services/SystemService';
import Message from '@js/Models/Message/Message';
import ErrorManager from '@js/Manager/ErrorManager';

class MessageService {

    constructor() {
        this._api = SystemService.getBrowserApi();
        this._enabled = false;
        this._messages = {};
        this._listeners = {};
        this._converters = {};
        this._defaultReceiver = null;

        this._messageListener = (m, s) => {
            return this._receiveMessage(m, s);
        };

        this._messageEnabler = (m, s) => {
            console.log('messages.enabled', 'event');
            this._enabled = true;
            this._sendMessages()
                .catch(ErrorManager.catch());
        };

        this._api.runtime.onMessage.addListener(this._messageListener);
        this._api.runtime.onConnect.addListener(this._messageEnabler);
        this._api.browserAction.onClicked.addListener(this._messageEnabler);
    }

    /**
     *
     * @param {(string|null)} value
     */
    setDefaultReceiver(value) {
        this._defaultReceiver = value;

        return this;
    }

    /**
     *
     */
    enable() {
        console.log('messages.enabled', 'force');
        this._enabled = true;
        this._api.runtime.onConnect.removeListener(this._messageEnabler);
        this._sendMessages()
            .catch(ErrorManager.catch());
    }

    /**
     *
     * @param {(string|array)} types
     * @param {Function} callback
     */
    listen(types, callback) {
        if(!Array.isArray(types)) types = [types];

        for(let type of types) {
            console.debug('message.listen', type);

            if(!this._listeners.hasOwnProperty(type)) {
                this._listeners[type] = [];
            }

            this._listeners[type].push(callback);
        }
    }

    /**
     *
     * @param {(string|array)} types
     * @param {Function} callback
     */
    convert(types, callback) {
        if(!Array.isArray(types)) types = [types];

        for(let type of types) {
            console.debug('message.convert', type);

            if(!this._converters.hasOwnProperty(type)) {
                this._converters[type] = [];
            }

            this._converters[type].push(callback);
        }
    }

    /**
     *
     * @param {Message|Object} message The message to be sent
     * @returns {Promise<Message>}
     */
    send(message) {
        message = this._validateMessage(message);

        return new Promise((resolve, reject) => {
            this._messages[message.getId()] = {
                message,
                resolve,
                reject,
                sent: this._enabled === true
            };

            if(this._enabled) {
                this._sendMessage(message.getId())
                    .catch(ErrorManager.catch());
            } else {
                console.log('message.queued', message);
            }
        });
    }

    /**
     *
     * @param {string} id
     * @returns {Promise<void>}
     * @private
     */
    async _sendMessage(id) {
        let {message, resolve, reject} = this._messages[id];
        message.setSender(SystemService.getArea());
        if(this._defaultReceiver !== null && message.getReceiver() === null) {
            message.setReceiver(this._defaultReceiver);
        }

        try {
            console.debug('message.send', message);
            this._messages[id].sent = true;
            let data = JSON.stringify(message),
                response = await this._api.runtime.sendMessage(data);

            if(response) {
                let reply = this._createMessageFromJSON(response);
                if(!reply) return;

                reply = await this._notifyConverters(reply);
                console.debug('reply.receive', reply);
                if(resolve) resolve(reply, message);
            } else {
                console.debug('message.response', response, message);
            }
        } catch(error) {
            ErrorManager.logError(error);
            if(reject) reject(error, message);
        }
    }

    /**
     *
     * @returns {Promise<void>}
     * @private
     */
    async _sendMessages() {
        let promises = [];

        for(let id in this._messages) {
            if(!this._messages.hasOwnProperty(id) || this._messages[id].sent) continue;
            promises.push(this._sendMessage(id));
        }

        await Promise.all(promises);
    }

    /**
     *
     * @param {string} data
     * @param {MessageSender} sender
     * @returns {Promise<Message>}
     * @private
     */
    _receiveMessage(data, sender) {
        let message = this._createMessageFromJSON(data);
        if(!message) return;

        return new Promise(
            (resolve, reject) => {
                this._notifyConverters(message).then(
                    (message) => {
                        this._processMessage(message).then(
                            (reply) => {
                                if(reply) {
                                    console.debug('reply.send', reply);
                                    resolve(JSON.stringify(reply));
                                } else if(message.getReceiver() !== null) {
                                    console.debug('reply.empty');
                                    resolve();
                                }
                            }).catch(reject);
                    }
                );
            }
        );
    }

    /**
     *
     * @param {string} data
     * @returns {(Message|void)}
     * @private
     */
    _createMessageFromJSON(data) {
        let message = new Message(JSON.parse(data));

        if(message.getReceiver() !== null && message.getReceiver() !== SystemService.getArea()) {
            console.debug('message.dismissed', message.getReceiver(), SystemService.getArea());
            return;
        }

        return message;
    }

    /**
     *
     * @returns {(Message|void)}
     * @private
     */
    async _processMessage(message) {
        console.debug('message.receive', message);
        if(message.getReply() !== null) {
            this._messages[message.getReply()].resolve(message);
        } else if(this._listeners.hasOwnProperty(message.getType())) {
            return await this._notifyListeners(message);
        }
    }

    /**
     *
     * @param {Message} message
     * @returns {Promise<Message>}
     * @private
     */
    async _notifyConverters(message) {
        if(this._converters.hasOwnProperty(message.getType())) {
            console.debug('message.convert', message);
            let converters = this._converters[message.getType()];

            for(let i = 0; i < converters.length; i++) {
                try {
                    let result = await converters[i](message);
                    if(result) message = result;
                } catch(e) {
                    ErrorManager.logError(e);
                }
            }
        }

        return message;
    }

    /**
     *
     * @param {Message} message
     * @returns {Promise<Message>}
     * @private
     */
    async _notifyListeners(message) {
        let listeners = this._listeners[message.getType()],
            reply     = new Message()
                .setReply(message.getId())
                .setSender(SystemService.getArea())
                .setReceiver(message.getSender());

        for(let i = 0; i < listeners.length; i++) {
            try {
                await listeners[i](message, reply);
            } catch(e) {
                ErrorManager.logError(e);
            }
        }

        if(reply.getPayload() || reply.getType()) return reply;
    }

    /**
     *
     * @param {Message|{}} message
     * @returns {Message}
     * @private
     */
    _validateMessage(message) {
        if(message instanceof Message) {
            return message;
        }

        if(!message.hasOwnProperty('type')) {
            message = {payload: message};
        }
        message = new Message(message);

        return message;
    }
}

export default new MessageService();