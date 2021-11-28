import Vue from 'vue';
import { v4 as uuid } from 'uuid';
import QueueService from '@js/Services/QueueService';
import SystemService from '@js/Services/SystemService';
import QueueClient from '@js/Queue/Client/QueueClient';
import ErrorManager from '@js/Manager/ErrorManager';
import Toast from '@js/Models/Toast/Toast';

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
        ErrorManager.toastService = this;
    }

    /**
     *
     * @param {(String|String[])} message The text of the toast
     * @param {(String|String[])} [title=null] The title of the toast
     * @param {Number} [ttl=3] Time before the toast is closed
     * @return {Promise<String>}
     */
    success(message, title = null, ttl = 3) {
        return this.create({type: 'success', title, message, closeable: true, ttl});
    }

    /**
     *
     * @param {(String|String[])} message The text of the toast
     * @param {(String|String[])} [title=null] The title of the toast
     * @param {Number} [ttl=10] Time before the toast is closed
     * @return {Promise<String>}
     */
    warning(message, title = null, ttl = 10) {
        return this.create({type: 'warning', title, message, closeable: true, ttl});
    }


    /**
     *
     * @param {(String|String[])} message The text of the toast
     * @param {(String|String[])} [title=null] The title of the toast
     * @param {Number} [ttl=10] Time before the toast is closed
     * @return {Promise<String>}
     */
    error(message, title = null, ttl = 10) {
        return this.create({type: 'error', title, message, closeable: true, ttl});
    }

    /**
     * await ToastService.info('text', 'title', {a: 'Option A', b: 'Option B'});
     *
     * @param {(String|String[])} message The text of the toast
     * @param {(String|String[])} [title=null] The title of the toast
     * @param {Object} [options=null] Object with available buttons
     * @param {Number} [ttl=10] Time before the toast is closed
     * @return {Promise<String>}
     */
    info(message, title = null, options = null, ttl = 10) {
        let config = {type: 'info', title, message, ttl};

        if(options !== null) config.options = options;
        config.closeable = options === null;

        return this.create(config);
    }


    /**
     *
     * @param {(Toast|Object)} data The configuration of the toast
     * @return {Promise<(String|null)>}
     */
    create(data) {
        let toast = this._createModel(data);

        if(!toast.getMessage()) {
            return new Promise((resolve, reject) => reject);
        }

        toast.setVisible(false);

        if(SystemService.getArea() === SystemService.AREA_BACKGROUND) {
            return this._sendToast(toast);
        }

        return this._createToast(toast);
    }

    /**
     *
     * @param {String} id
     * @param {(String|null)} [choice=null]
     */
    choose(id, choice = null) {
        for(let i = 0; i < this._activeToasts.length; i++) {
            if(this._activeToasts[i].getId() === id) {
                this._activeToasts.splice(i, 1);
                break;
            }
        }

        if(this._toasts.hasOwnProperty(id)) {
            this._toasts[id].resolve(choice);
            if(this._toasts[id].timer !== null) clearTimeout(this._toasts[id]);
            delete this._toasts[id];
        }
        this._removeFromQueue(id);
        this._checkActiveToasts();
    }

    /**
     * @param {String} tags
     */
    closeByTags(...tags) {
        for(let id in this._toasts) {
            if(!this._toasts.hasOwnProperty(id)) continue;
            let toast    = this._toasts[id].toast,
                itemTags = toast.getTags();

            let intersect = tags.filter(value => itemTags.includes(value));
            if(intersect.length === tags.length) this.choose(toast.getId());
        }
    }

    /**
     * @param {(Toast|Object)} data
     * @return {Toast}
     * @private
     */
    _createModel(data) {
        let model = data;
        if(!(data instanceof Toast)) {
            model = this._createModelFromData(data);
        }

        if(!model.getId() || this._toasts.hasOwnProperty(model.getId())) model.setId(uuid());
        if(typeof model.getCloseable() !== 'boolean') model.setCloseable(true);
        if(model.getCloseable() && model.getTtl() < this.MIN_TTL && model.getTtl() !== 0) model.setTtl(this.DEFAULT_TTL);
        if(model.getCloseable() && !model.getDefault()) model.setDefault('close');
        if(model.getTitle() && !model.getTitleVars()) model.setTitleVars([]);
        if(!model.getMessageVars()) model.setMessageVars([]);
        if(!model.getTags()) model.setTags([]);
        if(!model.getMessage() && model.getTitle()) {
            model.setMessage(model.getTitle());
            model.setMessageVars(model.getTitleVars());
            model.setTitle(undefined);
            model.setTitleVars([]);
        }

        return model;
    }

    /**
     * @param {Object} data
     * @return {Toast}
     * @private
     */
    _createModelFromData(data) {
        if(data.hasOwnProperty('text')) {
            data.message = data.text;
            delete data.text;
        }

        if(data.hasOwnProperty('buttons')) {
            data.options = data.buttons;
            delete data.buttons;
        }

        if(data.hasOwnProperty('title') && Array.isArray(data.title)) {
            let title = data.title.shift();
            data.titleVars = data.title;
            data.title = title;
        }

        if(data.hasOwnProperty('message') && Array.isArray(data.message)) {
            let message = data.message.shift();
            data.messageVars = data.message;
            data.message = message;
        }

        return new Toast(data);
    }

    /**
     *
     * @param {Toast} toast
     * @return {Promise<unknown>}
     * @private
     */
    _createToast(toast) {
        return new Promise((resolve) => {
            this._toasts[toast.getId()] = {toast, resolve, timer: null};

            if(this._activeToasts.length < this.MAX_ACTIVE) {
                this._activateToast(toast);
            }
        });
    }

    /**
     *
     * @param {Toast} toast
     * @return {Promise<Object>}
     * @private
     */
    _sendToast(toast) {
        return new Promise(async (resolve) => {
            this._toasts[toast.getId()] = {toast, resolve, timer: null};

            let queue = QueueService.getQueue('toasts', 'popup');
            try {
                let item = await queue.push(toast);
                delete this._toasts[toast.getId()];
                resolve(item.getResult());
            } catch(e) {
                ErrorManager.logError(e);
                delete this._toasts[toast.getId()];
                resolve(null);
            }
        });
    }

    /**
     * @private
     */
    _checkActiveToasts() {
        if(this._activeToasts.length >= this.MAX_ACTIVE) return;
        for(let id in this._toasts) {
            if(!this._toasts.hasOwnProperty(id)) continue;

            let toast = this._toasts[id].toast;
            if(!toast.getVisible()) {
                this._activateToast(toast);
                if(this._activeToasts.length >= this.MAX_ACTIVE) return;
            }
        }
    }

    /**
     * @param {Toast} toast
     * @private
     */
    _activateToast(toast) {
        toast.setVisible(true);
        this._activeToasts.push(toast);

        if(toast.getTtl() > 0) {
            let timeout = toast.getTtl() * 1000;
            this._toasts[toast.getId()].timer = setTimeout(() => {
                this.choose(toast.getId());
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

    /**
     * @param {String} id
     * @private
     */
    _removeFromQueue(id) {
        if(SystemService.getArea() === SystemService.AREA_BACKGROUND) {
            let queue = QueueService.getQueue('toasts', 'popup'),
                items = queue.getItems();

            for(let item of items) {
                if(item.getTask().getId() === id) queue.remove(item);
            }
        }
    }
}

export default new ToastService();