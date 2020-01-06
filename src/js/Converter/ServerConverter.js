import Server from '@js/Models/Server/Server';

export default class ServerConverter {

    /**
     *
     * @param {Message} message
     * @returns {Message}
     */
    convert(message) {
        if(message.getType() === 'server.items') {
            return this._covertItems(message);
        } else {
            return this._covertItem(message);
        }
    }

    /**
     *
     * @param {Message} message
     * @returns {Message}
     */
    _covertItems(message) {
        let payload = message.getPayload(),
            servers = [];

        if(payload !== null) {
            for(let data of payload) {
                servers.push(new Server(data));
            }
        }

        return message.setPayload(servers);
    }

    /**
     *
     * @param {Message} message
     * @returns {Message}
     */
    _covertItem(message) {
        let payload = message.getPayload();

        return message.setPayload(new Server(payload));
    }
}