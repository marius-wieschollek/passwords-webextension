import ServerRepository from "@js/Repositories/ServerRepository";

export default class Migration20002 {
    /**
     * Initialize server enabled flag
     *
     * @returns {Promise<void>}
     */
    async sync() {
        let servers = ServerRepository.findAll();
        for(let server of servers) {
            server.setEnabled(true);
            await ServerRepository.update(server);
        }
    }

    async local() {}
}