import polyfill from 'webextension-polyfill';

class BrowserApi {
    getBrowserApi() {
        return polyfill;
    }
}

export default new BrowserApi();