class RegistryService {

    constructor() {
        this.registry = [];
    }

    /**
     * @param {String} key
     * @returns {boolean}
     */
    has(key) {
        return this.registry.hasOwnProperty(key);
    }

    /**
     * @param {String} key
     * @returns {*}
     */
    get(key) {
        if(this.registry.hasOwnProperty(key)) {
            return this.registry[key];
        }
        return undefined;
    }

    /**
     * @param {String} key
     * @param {*} value
     */
    set(key, value) {
        this.registry[key] = value;
    }
}

export default new RegistryService();