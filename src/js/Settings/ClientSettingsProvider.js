import MessageService from '@js/Services/MessageService';
import Error from "@vue/Components/Passlink/Action/Error.vue";

class ClientSettingsProvider {

    get withServer() {
        return false;
    }

    /**
     * @param {String} name
     * @return {Promise<{value:*, scope:String}>}
     */
    async get(name) {
        /** @type {Message} **/
        let reply = await MessageService.send({type: 'setting.get', payload: name});
        if(reply.getType() !== 'setting.value') {
            throw new Error(reply.getPayload().message);
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
            throw new Error(reply.getPayload().message);
        }
    }

    /**
     * @param {String} name
     * @return {Promise<Object|*>}
     */
    async reset(name) {
        let reply = await MessageService.send({type: 'setting.reset', payload: name});

        if(reply.getType() !== 'setting.value') {
            throw new Error(reply.getPayload().message);
        }

        return reply.getPayload();
    }

    async setForServer() {
        throw new Error('setForServer is not supported');
    }

    async getForServer() {
        throw new Error('getForServer is not supported');
    }

    async resetForServer() {
        throw new Error('resetForServer is not supported');
    }
}

export default new ClientSettingsProvider();