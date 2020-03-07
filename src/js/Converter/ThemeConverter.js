import Theme from '@js/Models/Theme/Theme';

export default class ThemeConverter {
    /**
     *
     * @param {Message} message
     * @returns {Message}
     */
    convert(message) {
        if(message.getType() === 'theme.items') {
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
                servers.push(new Theme(data));
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

        return message.setPayload(new Theme(payload));
    }
}