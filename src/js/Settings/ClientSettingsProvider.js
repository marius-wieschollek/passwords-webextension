import MessageService from '@js/Services/MessageService';

class ClientSettingsProvider {

    /**
     * @param {String} name
     * @return {Promise<{value:*, scope:String}>}
     */
    async get(name) {
        /** @type {Message} **/
        let reply = await MessageService.send({type: 'setting.get', payload: name});
        if(reply.getType() !== 'setting.value') {
            throw new Error(reply.getPayload().message)
        }

        return reply.getPayload();
    }

    /**
     *
     * @param {String} name
     * @param {*} value
     * @return {Promise<void>}
     */
    async set(name, value) {
        let reply = await MessageService.send({type: 'setting.set', payload: {setting: name, value}});
        if(!reply.getPayload().success) {
            throw new Error(reply.getPayload().message)
        }
    }

    /**
     * @param {String} name
     * @return {Promise<Object|*>}
     */
    async reset(name) {
        let reply = await MessageService.send({type: 'setting.reset', payload: name});

        if(reply.getType() !== 'setting.value') {
            throw new Error(reply.getPayload().message)
        }

        return reply.getPayload();
    }
}

export default new ClientSettingsProvider();