import AbstractNotification from '@js/Models/Notification/AbstractNotification';
import LocalisationService from '@js/Services/LocalisationService';
import SystemService from '@js/Services/SystemService';
import RegistryService from '@js/Services/RegistryService';
import MiningClient from '@js/Queue/Client/MiningClient';
import Url from 'url-parse';
import QueueService from '@js/Services/QueueService';

export default class UpdatePasswordNotification extends AbstractNotification {

    /**
     * @param {MiningItem} item
     */
    constructor(item) {
        super();
        this._item = item;
        this.setTitle('NotifyUpdatePasswordTitle');
        this._setText();
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
        this._setText();
        return this;
    }

    /**
     * @return {({title: String})[]}
     */
    getButtons() {
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
    onClick() {
        this._openBrowserAction();
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
    _setText() {
        let label = this._item.getLabel();

        if(label.length === 0) {
            label = this._item.getResultField('username');
        }

        if(label.length === 0) {
            let href = this._item.getResultField('url'),
                url  = Url(href);

            label = url.host.length === 0 ? href:url.host;
        }

        if(SystemService.hasNotificationButtons()) {
            this.setText('NotifyUpdatePasswordText', label);
        } else {
            this.setText('NotifyUpdatePasswordTextFF', label);
        }
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

        SystemService.getBrowserApi().getBrowserAction().openPopup();
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