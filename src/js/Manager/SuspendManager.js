import {emit} from "@js/Event/Events";

export default new class SuspendManager {
    #lastTime = null;
    #interval = null;

    constructor() {
        this.#lastTime = null;
        this.#interval = null;
    }

    init() {
        this.#lastTime = Date.now()/1000;
        this.#interval = setInterval(
            () => {this.#check()},
            20e3
        )
    }

    #check() {
        let now = Date.now()/1000;

        if(now - this.#lastTime > 25) {
            emit('energy:suspend:resume');
        }

        this.#lastTime = now;
    }
}