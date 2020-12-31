export default class AbstractController {

    /**
     *
     * @param {Message} message
     * @param {Message} reply
     */
    async execute(message, reply) {
        console.trace('controller.execute() not implemented')
    }
}