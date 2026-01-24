import ErrorManager from "@js/Manager/ErrorManager";

export default new class TimerService {
    #intervals = [];
    #interval = null;

    init() {
        if(this.#interval) {
            clearInterval(this.#interval);
        }

        this.#interval = setInterval(
            () => {
                this.#run(10);
            },
            10e3
        );
    }

    /**
     *
     * @param {Function} listener
     * @param {Number} interval
     */
    addInterval(listener, interval) {
        this.#intervals.push(
            {
                listener,
                interval,
                expired: 0,
                active : false,
                once   : false
            }
        );
    }

    /**
     *
     * @param {Function} listener
     */
    removeInterval(listener) {
        for(let index in this.#intervals) {
            if(!this.#intervals[index].once && this.#intervals[index].listener === listener) {
                delete this.#intervals[index];
            }
        }
    }

    /**
     *
     * @param {Function} listener
     * @param {Number} interval
     */
    addTimeout(listener, interval) {
        this.#intervals.push(
            {
                listener,
                interval,
                expired: 0,
                active : false,
                once   : true
            }
        );
    }

    /**
     *
     * @param {Function} listener
     */
    removeTimeout(listener) {
        for(let index in this.#intervals) {
            if(this.#intervals[index].once && this.#intervals[index].listener === listener) {
                delete this.#intervals[index];
            }
        }
    }

    async #run(timeInSeconds) {
        for(let index in this.#intervals) {
            let item = this.#intervals[index];

            item.expired += timeInSeconds;
            if(item.expired >= item.interval) {
                item.active = true;
                try {
                    await item.listener();
                } catch(e) {
                    ErrorManager.logError(e);
                }

                if(item.once) {
                    delete this.#intervals[index];
                } else {
                    item.expired = 0;
                    item.active = false;
                }
            }
        }
    }
};