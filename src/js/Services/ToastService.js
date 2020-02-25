import Vue from 'vue';
import uuid from 'uuidv4';
import QueueService from '@js/Services/QueueService';
import SystemService from '@js/Services/SystemService';
import QueueClient from '@js/Queue/Client/QueueClient';
import ErrorManager from '@js/Manager/ErrorManager';

class ToastService {

    get MIN_TTL() {
        return 3;
    }

    get DEFAULT_TTL() {
        return 5;
    }

    get MAX_ACTIVE() {
        return 3;
    }

    constructor() {
        this._toasts = {};
        this._activeToasts = [];
        this._container = null;
        this._consumer = null;
    }

    async init() {
        if(SystemService.getArea() === SystemService.AREA_BACKGROUND) return;

        let Toasts          = await import(/* webpackChunkName: "ToastsComponents" */ '@vue/Components/Toasts'),
            ToastsContainer = Vue.extend(Toasts.default);

        this._container = new ToastsContainer({el: '#toasts', propsData: {toasts: this._activeToasts}});

        if(SystemService.getArea() === SystemService.AREA_POPUP) {
            this._consumer = new QueueClient('toasts', (item) => { return this._processQueueItem(item); });
        }
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
        return this.create({type: 'error', title, text, closeable: true, ttl: 15});
    }

    /**
     * await ToastService.info('text', 'title', {a: 'Option A', b: 'Option B'});
     *
     * @param {String} text The text of the toast
     * @param {String} [title=null] The title of the toast
     * @param {Object} [buttons=null] Object with available buttons
     * @param {Number} [ttl=10] Time before the toast is closed
     * @return {Promise<String>}
     */
    info(text, title = null, buttons = null, ttl = 10) {
        let config = {type: 'info', title, text, ttl};

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

        toast.visible = false;
        if(!toast.hasOwnProperty('closeable')) toast.closeable = true;
        if(toast.closeable && (!toast.hasOwnProperty('ttl') || toast.ttl < this.MIN_TTL)) toast.ttl = this.DEFAULT_TTL;
        if(!toast.hasOwnProperty('id') || !toast.id || this._toasts.hasOwnProperty(toast.id)) toast.id = uuid();

        if(SystemService.getArea() === SystemService.AREA_BACKGROUND) {
            return this._sendToast(toast);
        }

        return this._createToast(toast);
    }

    _createToast(toast) {
        return new Promise((resolve) => {
            this._toasts[toast.id] = {toast, resolve, timer: null};

            if(this._activeToasts.length < this.MAX_ACTIVE) {
                this._activateToast(toast);
            }
            console.log('toast.created', toast);
        });
    }

    async _sendToast(toast) {
        let queue = QueueService.getQueue('toasts', 'popup'),
            item  = await queue.push(toast);

        return item.getResult();
    }

    choose(id, choice) {
        for(let i = 0; i < this._activeToasts.length; i++) {
            if(this._activeToasts[i].id === id) {
                this._activeToasts.splice(i, 1);
                break;
            }
        }

        if(this._toasts.hasOwnProperty(id)) {
            this._toasts[id].resolve(choice);
            if(this._toasts[id].timer !== null) clearTimeout(this._toasts[id]);
            delete this._toasts[id];
        }

        this._checkActiveToasts();
    }

    _checkActiveToasts() {
        if(this._activeToasts.length >= this.MAX_ACTIVE) return;
        for(let id in this._toasts) {
            if(!this._toasts.hasOwnProperty(id)) continue;

            let toast = this._toasts[id].toast;
            if(!toast.visible) {
                this._activateToast(toast);
                if(this._activeToasts.length >= this.MAX_ACTIVE) return;
            }
        }
    }

    _activateToast(toast) {
        toast.visible = true;
        this._activeToasts.push(toast);

        if(toast.ttl) {
            let timeout = toast.ttl * 1000;
            this._toasts[toast.id].timer = setTimeout(() => {
                this.choose(toast.id, 'close');
            }, timeout);
        }
    }

    /**
     *
     * @param {QueueItem} item
     * @return {Promise<void>}
     * @private
     */
    async _processQueueItem(item) {
        try {
            let result = await this.create(item.getTask());
            item.setSuccess(true).setResult(result);
        } catch(e) {
            ErrorManager.logError(e);
            item.setSuccess(false).setResult(e);
        }
    }
}

export default new ToastService();