import SettingsService from "@js/Services/SettingsService";
import ServerRepository from "@js/Repositories/ServerRepository";

export default class Migration20001 {
    /**
     * Store detfault server as setting
     *
     * @returns {Promise<void>}
     */
    async sync() {
        if(await SettingsService.getValue('server.default') === null) {
            let servers = ServerRepository.findAll();

            if(servers.length > 0) {
                await SettingsService.set('server.default', servers[0].getId());
            }
        }
    }

    async local() {}
}