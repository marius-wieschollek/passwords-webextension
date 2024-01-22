export default new class HashingHelper {
    async sha1(str) {
        const textEncoder = new TextEncoder(),
              hash = await crypto.subtle.digest('SHA-1', textEncoder.encode(str));

        return Array.from(new Uint8Array(hash))
                    .map(v => v.toString(16).padStart(2, '0'))
                    .join('');
    }
};