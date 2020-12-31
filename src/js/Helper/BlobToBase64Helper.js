export default new class BlobToBase64Helper {
    /**
     * @public
     * @param {Blob} blob
     * @returns {Promise<String>}
     */
    async convert(blob) {
        return new Promise((resolve, reject) => {
            let reader = new FileReader();
            reader.addEventListener('loadend', () => {
                resolve(reader.result);
            });
            reader.addEventListener('error', (e) => {
                reject(e);
            });
            reader.readAsDataURL(blob);
        });
    }
}