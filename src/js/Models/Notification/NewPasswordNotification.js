import AbstractNotification from '@js/Models/Notification/AbstractNotification';
import LocalisationService from '@js/Services/LocalisationService';
import SystemService from '@js/Services/SystemService';
import RegistryService from '@js/Services/RegistryService';
import MiningClient from '@js/Queue/Client/MiningClient';
import Url from 'url-parse';
import QueueService from '@js/Services/QueueService';
import SettingsService from "@js/Services/SettingsService";

export default class NewPasswordNotification extends AbstractNotification {

    /**
     * @param {MiningItem} item
     */
    constructor(item) {
        super();
        this._item = item;
        this._quicksave = null;
        this.setTitle('NotifyNewPasswordTitle');
    }

    /**
     * @return {MiningItem}
     */
    getItem() {
        return this._item;
    }

    /**
     * @param {MiningItem} item
     * @return {NewPasswordNotification}
     */
    setItem(item) {
        this._item = item;
        return this;
    }

    /**
     * @return {({title: String})[]}
     */
    async getButtons() {
        if(await this._isQuickSave()) {
            return [];
        }
        return [
            {
                title: LocalisationService.translate('ButtonSave')
            },
            {
                title: LocalisationService.translate('ButtonMore')
            }
        ];
    }

    /**
     *
     */
    async onClick() {
        if(await this._isQuickSave()) {
            this._savePasswordItem();
        } else {
            this._openBrowserAction();
        }
    }

    /**
     * @param {Number} id
     */
    onButtonClick(id) {
        if(id === 0) {
            this._savePasswordItem();
        } else if(id === 1) {
            this._openBrowserAction();
        }
    }

    /**
     * @private
     */
    async getText() {
        let label = this._item.getLabel();

        if(label.length === 0) {
            label = this._item.getResultField('username');
        }

        if(label.length === 0) {
            let href = this._item.getResultField('url'),
                url  = Url(href);

            label = url.host.length === 0 ? href:url.host;
        }


        if(!await this._isQuickSave()) {
            if(SystemService.hasNotificationButtons()) {
                this.setText('NotifyNewPasswordText', label);
            } else {
                this.setText('NotifyNewPasswordTextFF', label);
            }
        } else {
            this.setText('NotifyNewPasswordTextQS', label);
        }

        return super.getText();
    }

    /**
     *
     * @returns {Promise<null>}
     * @private
     */
    async _isQuickSave() {
        if(this._quicksave === null) {
            this._quicksave = await SettingsService.getValue('notification.password.quicksave');
        }
        return this._quicksave;
    }

    /**
     * @private
     */
    _openBrowserAction() {
        RegistryService.set('popup.tab', 'collected');

        let data = RegistryService.get('popup.data');
        if(data === undefined) data = {};
        data.collected = {current: this._item.getId()};
        RegistryService.set('popup.data', data);

        SystemService.getBrowserApi().browserAction.openPopup();
    }

    /**
     * @private
     */
    _savePasswordItem() {
        if(QueueService.hasQueue('mining')) {
            let queue = QueueService.getQueue('mining');
            MiningClient.setQueue(queue);
            MiningClient.solveItem(this._item)
                .then(() => {
                    MiningClient.setQueue(null);
                });
        }
    }
}