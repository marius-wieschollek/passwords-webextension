import SystemService from '@js/Services/SystemService';
import ErrorManager from '@js/Manager/ErrorManager';
import NewPasswordNotification from '@js/Models/Notification/NewPasswordNotification';
import SettingsService from '@js/Services/SettingsService';
import UpdatePasswordNotification from "@js/Models/Notification/UpdatePasswordNotification";

class NotificationService {

    constructor() {
        this._notifications = {};
    }

    init() {
        let api = SystemService.getBrowserApi();
        api.notifications.onClicked.addListener((id) => { this._processNotificationClick(id); });
        api.notifications.onClosed.addListener((id) => { this._processNotificationClose(id); });
        if(SystemService.hasNotificationButtons()) {
            api.notifications.onButtonClicked.addListener((id, button) => { this._processButtonClick(id, button); });
        }

        if(SystemService.hasNotificationOnShow()) {
            api.notifications.onShown.addListener((id) => { this._processNotificationShow(id); });
        }
    }

    /**
     *
     * @param {MiningItem} item
     * @return {Promise<NewPasswordNotification>}
     */
    async newPasswordNotification(item) {
        let notification = new NewPasswordNotification(item);

        if(await SettingsService.getValue('notification.password.new')) {
            this._sendNotification(notification);
        }

        return notification;
    }

    /**
     *
     * @param {MiningItem} item
     * @return {Promise<UpdatePasswordNotification>}
     */
    async updatePasswordNotification(item) {
        let notification = new UpdatePasswordNotification(item);

        if(await SettingsService.getValue('notification.password.update')) {
            this._sendNotification(notification);
        }

        return notification;
    }

    /**
     *
     * @param {(String|AbstractNotification)} notification
     */
    remove(notification) {
        let id = typeof notification === 'string' ? notification:notification.getId();

        SystemService.getBrowserApi().notifications.clear(id);
    }

    /**
     * @param {AbstractNotification} notification
     * @private
     */
    _sendNotification(notification) {
        this._notifications[notification.getId()] = notification;

        SystemService.getBrowserApi().notifications.create(
            notification.getId(),
            notification.getOptions()
        ).catch(ErrorManager.catch);
    }

    /**
     * @param {String} id
     * @private
     */
    _processNotificationShow(id) {
        if(!this._notifications.hasOwnProperty(id)) return;
        let notification = this._notifications[id];

        this._triggerEvent(notification, 'onShown')
            .catch(ErrorManager.catch);
    }


    /**
     * @param {String} id
     * @private
     */
    _processNotificationClick(id) {
        if(!this._notifications.hasOwnProperty(id)) return;
        let notification = this._notifications[id];

        this._triggerEvent(notification, 'onClick')
            .catch(ErrorManager.catch);
    }


    /**
     * @param {String} id
     * @param {Number} button
     * @private
     */
    _processButtonClick(id, button) {
        if(!this._notifications.hasOwnProperty(id)) return;
        let notification = this._notifications[id];

        this._triggerEvent(notification, 'onButtonClick', button)
            .catch(ErrorManager.catch);
    }


    /**
     * @param {String} id
     * @private
     */
    _processNotificationClose(id) {
        if(!this._notifications.hasOwnProperty(id)) return;
        let notification = this._notifications[id];
        delete this._notifications[id];

        this._triggerEvent(notification, 'onClose')
            .catch(ErrorManager.catch);
    }

    /**
     * @param {AbstractNotification} notification
     * @param {String} event
     * @param {*} parameters
     * @return {Promise<void>}
     * @private
     */
    async _triggerEvent(notification, event, ...parameters) {
        if(typeof notification[event] === 'function') {
            await notification[event](...parameters);
        }
    }
}

export default new NotificationService();