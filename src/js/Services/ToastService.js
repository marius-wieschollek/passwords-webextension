import Vue from 'vue';
import uuid from 'uuidv4';

class ToastService {

    constructor() {
        this._toasts = {};
        this._activeToasts = [];
        this._container = null;
    }

    async init() {
        let Toasts          = await import(/* webpackChunkName: "ToastsComponents" */ '@vue/Components/Toasts'),
            ToastsContainer = Vue.extend(Toasts.default);

        this._container = new ToastsContainer({el: '#toasts', propsData: {toasts: this._activeToasts}});
    }


    /**
     *
     * @param {String} text The text of the toast
     * @param {String} [title=null] The title of the toast
     * @return {Promise<String>}
     */
    warning(text, title = null) {
        return this.create({type: 'warning', title, text, closeable: true, ttl: 10});
    }


    /**
     *
     * @param {String} text The text of the toast
     * @param {String} [title=null] The title of the toast
     * @return {Promise<String>}
     */
    error(text, title = null) {
        return this.create({type: 'error', title, text, closeable: true, ttl: 10});
    }

    /**
     * await ToastService.info('text', 'title', {a: 'Option A', b: 'Option B'});
     *
     * @param {String} text The text of the toast
     * @param {String} [title=null] The title of the toast
     * @param {Object} [buttons=null] Object with available buttons
     * @return {Promise<String>}
     */
    info(text, title = null, buttons = null) {
        let config = {type: 'info', title, text, ttl: 10};

        if(buttons !== null) config.buttons = buttons;
        config.closeable = buttons === null;

        return this.create(config);
    }

    /**
     *
     * @param {String} text The text of the toast
     * @param {String} [title=null] The title of the toast
     * @return {Promise<String>}
     */
    success(text, title = null) {
        return this.create({type: 'success', title, text, closeable: true, ttl: 5});
    }


    /**
     *
     * @param {Object} toast The configuration of the toast
     * @return {Promise<String>}
     */
    create(toast) {
        if(!toast.text && !toast.title) {
            return new Promise((resolve, reject) => reject);
        }

        toast.id = uuid();
        toast.visible = false;
        if(!toast.hasOwnProperty('closeable')) toast.closeable = true;

        return new Promise((resolve) => {
            if(this._activeToasts.length < 3) {
                toast.visible = true;
                this._activeToasts.push(toast);
            }

            this._toasts[toast.id] = {toast, resolve};
            console.log('toast.created', toast);
        });
    }

    choose(id, choice) {
        for(let i = 0; i < this._activeToasts.length; i++) {
            if(this._activeToasts[i].id === id) {
                this._activeToasts.splice(i, 1);
                break;
            }
        }

        this._toasts[id].resolve(choice);
        delete this._toasts[id];
        this._checkActivePosts();
    }

    _checkActivePosts() {
        if(this._activeToasts.length > 2) return;
        for(let item of this._toasts) {
            if(!item.toast.visible) {
                this._activeToasts.push(toast);
                if(this._activeToasts.length > 2) return;
            }
        }
    }
}

export default new ToastService();