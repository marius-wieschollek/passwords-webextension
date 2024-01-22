import SystemService from '@js/Services/SystemService';
import Message from '@js/Models/Message/Message';
import ErrorManager from '@js/Manager/ErrorManager';

class MessageService {

    constructor() {
        this._api = SystemService.getBrowserApi();
        this._sender = null;
        this._enabled = false;
        this._clients = {};
        this._tabs = {};
        this._messages = {};
        this._listeners = {};
        this._converters = {};
        this._defaultReceiver = null;
        this._connector = null;

        this._messageListener = (m, s) => {
            return this._receiveMessage(m, s);
        };

        this._messageEnabler = (client) => {
            this._enabled = true;
            this._clients[client.name] = true;
            if(client.name === 'client' && client?.sender?.tab?.id) {
                this._tabs[client.sender.tab.id] = true;
            }

            this._sendMessages()
                .catch(ErrorManager.catch);

            client.onDisconnect.addListener(() => {
                this._clients[client.name] = false;
                if(client.name === 'client' && client?.sender?.tab?.id) {
                    this._tabs[client.sender.tab.id] = false;
                }
            })
        };
    }

    /**
     *
     * @param {Boolean} enabled
     * @param {String} defaultReceiver
     * @param {Boolean} hasWindow
     * @returns {Promise<MessageService>}
     */
    async init(enabled = false, defaultReceiver = null, hasWindow = false) {
        if(hasWindow) window.messageService = this;
        this._sender = SystemService.getArea();

        if(defaultReceiver) this._defaultReceiver = defaultReceiver;

        this._api.runtime.onMessage.addListener(this._messageListener);
        if(SystemService.getArea() === SystemService.AREA_BACKGROUND) {
            this._api.runtime.onConnect.addListener(this._messageEnabler);
            SystemService.getBrowserAction().onClicked.addListener(this._messageEnabler);

            if(hasWindow)
                this._connector = {
                    inboxMessage: (m) => {
                        return this._receiveMessage(m);
                    }
                };
            }
            window.inboxMessage = (m) => {
                return this._receiveMessage(m);
            };
        } else if(SystemService.getArea() !== SystemService.AREA_CLIENT) {
            // @TODO check if works with firefox
            //this._connector = await this._api.runtime.getBackgroundPage();
        }

        if(enabled) this.enable();

        return this;
    }

    /**
     *
     * @param {(String|null)} value
     */
    setDefaultReceiver(value) {
        this._defaultReceiver = value;

        return this;
    }

    /**
     *
     */
    enable() {
        this._enabled = true;
        this._sendMessages()
            .catch(ErrorManager.catch);
    }

    /**
     *
     * @param {(String|array)} types
     * @param {Function} callback
     */
    listen(types, callback) {
        if(!Array.isArray(types)) types = [types];

        for(let type of types) {
            if(!this._listeners.hasOwnProperty(type)) {
                this._listeners[type] = [];
            }

            this._listeners[type].push(callback);
        }
    }

    /**
     *
     * @param {(String|array)} types
     * @param {Function} callback
     */
    convert(types, callback) {
        if(!Array.isArray(types)) types = [types];

        for(let type of types) {
            if(!this._converters.hasOwnProperty(type)) {
                this._converters[type] = [];
            }

            this._converters[type].push(callback);
        }
    }

    /**
     *
     * @param {(Message|Object|String)} message The message to be sent
     * @returns {Promise<Message>}
     */
    send(message) {
        message = this._validateMessage(message);

        return new Promise((resolve, reject) => {
            let send = this._canSendMessage(message);
            this._messages[message.getId()] = {
                message,
                resolve,
                reject,
                sent: send
            };

            if(send) {
                this._sendMessage(message.getId())
                    .catch(ErrorManager.catch);
            }
        });
    }

    /**
     * @param {Message} message
     * @return {Promise<Message|void>}
     */
    async sendLocal(message) {
        message = this._validateMessage(message);

        return this._receiveMessage(JSON.stringify(message));
    }

    /**
     *
     * @param {String} id
     * @returns {Promise<void>}
     * @private
     */
    async _sendMessage(id) {
        let {message, resolve, reject} = this._messages[id];
        message.setSender(this._sender);
        if(this._defaultReceiver !== null && message.getReceiver() === null) {
            message.setReceiver(this._defaultReceiver);
        }

        let response;
        try {
            this._messages[id].sent = true;
            let data = JSON.stringify(message);

            if(message.getChannel() === 'tabs') {
                response = await this._api.tabs.sendMessage(message.getTab(), data);
            } else {
                if(message.getReceiver() === 'background' && this._connector !== null && this._connector.inboxMessage) {
                    response = await this._connector.inboxMessage(data);
                } else {
                    response = await this._api.runtime.sendMessage(data);
                }
            }
        } catch(error) {
            ErrorManager.logError(error, message);
            if(reject) reject(error, message);
            return;
        }

        if(response && resolve) {
            try {
                let reply = this._createMessageFromJSON(response);
                if(!reply) {
                    resolve(null, message);
                    return;
                }

                reply = await this._notifyConverters(reply);
                resolve(reply, message);
            } catch(error) {
                ErrorManager.logError(error, message);
                if(reject) reject(error, message);
            }
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
            if(!this._messages.hasOwnProperty(id) || this._messages[id].sent || !this._canSendMessage(this._messages[id].message)) continue;
            promises.push(this._sendMessage(id));
        }

        await Promise.all(promises);
    }

    /**
     *
     * @param {String} data
     * @param {MessageSender} sender
     * @returns {(Promise<Message>|void)}
     * @private
     */
    _receiveMessage(data, sender = null) {
        let isFromTab = this._sentFromTab(sender),
            message   = this._createMessageFromJSON(data, isFromTab);
        if(!message || (sender !== null && sender.id !== SystemService.getExtensionId())) return;

        return new Promise(
            (resolve, reject) => {
                this._processReceivedMessage(message)
                    .then((reply) => {
                        if(!message.getSilent() || reply !== undefined) {
                            resolve(reply);
                        }
                    })
                    .catch(reject);
            }
        );
    }

    /**
     *
     * @param {Message} message
     * @return {Promise<string>}
     * @private
     */
    async _processReceivedMessage(message) {
        try {
            message = await this._notifyConverters(message);
            let reply = await this._processMessage(message);

            if(reply) return JSON.stringify(reply);
        } catch(e) {
            ErrorManager.logError(e, message);
            throw e;
        }
    }

    /**
     *
     * @param {MessageSender} sender
     * @return {boolean}
     * @private
     */
    _sentFromTab(sender) {
        let chromeURL  = `chrome-extension://${SystemService.getExtensionId()}/html/`,
            firefoxURL = `moz-extension://${SystemService.getExtensionId()}/html/`;

        return sender !== null &&
               sender.hasOwnProperty('tab') &&
               (sender.tab.url.substr(0, chromeURL.length) !== chromeURL && sender.tab.url.substr(0, firefoxURL.length) !== firefoxURL) &&
               (!sender.hasOwnProperty('envType') || sender.envType !== 'addon_child');
    }

    /**
     *
     * @param {String} data
     * @param {Boolean} fromTab
     * @returns {(Message|void)}
     * @private
     */
    _createMessageFromJSON(data, fromTab = false) {
        let message = new Message(JSON.parse(data));

        if(message.getReceiver() !== null && message.getReceiver() !== this._sender) return;
        if(fromTab && this._checkClientRestrictions(message)) return;

        return message;
    }

    /**
     *
     * @param {Message} message
     * @returns {Boolean}
     * @private
     */
    _checkClientRestrictions(message) {
        return message.getSender() !== 'client' ||
               (message.getType() !== 'password.mine' && message.getType() !== 'queue.items' && message.getType() !== 'debug.form.fields' && message.getType() !== 'autofill.page.ready') ||
               (message.getType() === 'queue.items' && message.getPayload().name !== 'error');
    }

    /**
     *
     * @returns {(Message|void)}
     * @private
     */
    async _processMessage(message) {
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
                .setSender(this._sender)
                .setReceiver(message.getSender());

        for(let i = 0; i < listeners.length; i++) {
            try {
                await listeners[i](message, reply);
            } catch(e) {
                ErrorManager.logError(e);
            }
        }

        if((reply.getPayload() !== null && reply.getPayload() !== undefined) || reply.getType()) return reply;
    }

    /**
     *
     * @param {Message|Object|String} message
     * @returns {Message}
     * @private
     */
    _validateMessage(message) {
        if(message instanceof Message) return message;
        if(typeof message === 'string') message = {type: message};
        if(!message.hasOwnProperty('type')) message = {payload: message};
        message = new Message(message);

        return message;
    }

    /**
     * @param {Message} message
     * @returns {boolean|*}
     * @private
     */
    _canSendMessage(message) {
        if(SystemService.getArea() !== SystemService.AREA_BACKGROUND || !this._enabled) return this._enabled;
        let receiver = message.getReceiver();

        if(receiver === null && this._defaultReceiver !== null) receiver = this._defaultReceiver;
        if(receiver === null || receiver === this._sender) return this._enabled;

        return this._clients.hasOwnProperty(receiver) && this._clients[receiver] &&
               (receiver !== 'client' || (this._tabs.hasOwnProperty(message.getTab()) && this._tabs[message.getTab()]));
    }
}

export default new MessageService();