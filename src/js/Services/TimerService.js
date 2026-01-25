import ErrorManager from "@js/Manager/ErrorManager";
import UuidHelper from "@js/Helper/UuidHelper";
import BrowserApi from "@js/Platform/BrowserApi";

export default new class TimerService {
    #intervals = {};

    init() {
        this.addInterval(
            () => {
                BrowserApi.getBrowserApi().runtime.getPlatformInfo();
            },
            20
        );
    }

    /**
     *
     * @param {Function} listener
     * @param {Number} interval
     * @param {(Object|null)} data
     */
    addInterval(listener, interval, data = null) {
        let uuid = UuidHelper.generate(),
            id   = setInterval(() => {this.#run(uuid);}, interval * 1000);

        this.#intervals[uuid] = {
            listener,
            data,
            id,
            once: false
        };
    }

    /**
     *
     * @param {Function} listener
     */
    removeInterval(listener) {
        for(let index in this.#intervals) {
            let interval = this.#intervals[index];
            if(!interval.once && interval.listener === listener) {
                clearInterval(interval.id);

                delete this.#intervals[index];
            }
        }
    }

    /**
     *
     * @param {Function} listener
     * @param {Number} interval
     * @param {(Object|null)} data
     */
    addTimeout(listener, interval, data= null) {
        let uuid = UuidHelper.generate(),
            id   = setInterval(() => {this.#run(uuid);}, interval * 1000);

        this.#intervals[uuid] = {
            listener,
            data,
            id,
            once: true
        };
    }

    /**
     *
     * @param {Function} listener
     */
    removeTimeout(listener) {
        for(let index in this.#intervals) {
            let interval = this.#intervals[index];
            if(interval.once && interval.listener === listener) {
                clearTimeout(interval.id);

                delete this.#intervals[index];
            }
        }
    }

    async #run(id) {
        if(!this.#intervals.hasOwnProperty(id)) {
            return;
        }
        let interval = this.#intervals[id];
        try {
            await interval.listener(interval.data);
        } catch(e) {
            ErrorManager.logError(e);
        }

        if(interval.once) {
            delete this.#intervals[id];
        }
    }
};