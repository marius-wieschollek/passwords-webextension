import ApiManager from "@js/Manager/ApiManager";
import PasswordIndexer from "@js/Search/Index/PasswordIndexer";

class SearchService {

    constructor() {
        this._apis = {};
        this._pwIndex = new PasswordIndexer();
    }

    /**
     *
     * @param server
     */
    addServer(server) {

        let api = ApiManager.getApiForServer(server);

        if(api.isAuthorized) {
            this._apis[server.id] = api;
            this._refreshApi(api, server.id);
        }
    }

    refreshServer(server) {
        if(this._apis.hasOwnProperty(server.id)) {
            this._refreshApi(this._apis[server.id], server.id);
        }
    }

    async _refreshApi(api, serverId) {
        let passwords = await api.listPasswords('model+tags');

        for(let id in passwords) {
            if(!passwords.hasOwnProperty(id)) continue;
            let password = passwords[id];

            password.server = serverId;
            this._pwIndex.addItem(password);
        }
    }
}

export default new SearchService();