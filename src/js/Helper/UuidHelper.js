export default new class UuidHelper {

    generate() {
        let uuidFunc = crypto?.randomUUID;

        if(uuidFunc) {
            return crypto.randomUUID();
        }

        return this._fallbackUuid();
    }

    _fallbackUuid() {
        return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, c =>
            (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
        );
    }
}