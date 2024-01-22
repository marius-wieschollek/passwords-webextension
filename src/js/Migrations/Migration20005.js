import ServerRepository from "@js/Repositories/ServerRepository";

export default class Migration20005 {

    /**
     * Store tokens and servers separately.
     * It's done automatically, so the servers just need to be saved once.
     *
     * @returns {Promise<void>}
     */
    async sync() {
        let servers = ServerRepository.findAll();
        for(let server of servers) {
            await ServerRepository.update(server);
        }
    }

    async local() {}
}