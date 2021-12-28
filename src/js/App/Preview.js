import Vue from 'vue';
import ErrorManager from '@js/Manager/ErrorManager';
import Popup from '@js/App/Popup';
import MessageService from '@js/Services/MessageService';
import ThemeService from '@js/Services/ThemeService';
import SystemService from '@js/Services/SystemService';
import Message from '@js/Models/Message/Message';
import Server from '@js/Models/Server/Server';
import {Folder, Password} from 'passwords-client/models';
import LocalisationService from '@js/Services/LocalisationService';
import MiningItem from '@js/Models/Queue/MiningItem';

class Preview {

    /**
     *
     * @return {(Vue|null)}
     */
    get app() {
        return this._popup.app;
    }

    constructor() {
        this._popup = Popup;
    }

    async init() {
        this._modifyMessageService();
        await this._popup.init();
        this._initVue().catch(ErrorManager.catch);

        MessageService.listen(
            'theme.preview',
            (message, reply) => {
                this._applyTheme(message.getPayload());
            }
        );
    }

    _modifyMessageService() {
        let closure = MessageService.send;
        MessageService.send = (m) => {
            return this._messageSendPlugin(m, closure);
        };

        MessageService.convert('queue.items', (m) => { return this._replaceQueueItems(m); });
    }

    async _initVue() {
        let container = document.createElement('div');
        container.id = 'demo';
        document.body.appendChild(container);

        let Menu          = await import(/* webpackChunkName: "DemoMenu" */ '@vue/Components/Demo/DemoMenu'),
            MenuContainer = Vue.extend(Menu.default);

        new MenuContainer({el: '#demo'});
    }

    /**
     * @param {Theme} theme
     * @private
     */
    _applyTheme(theme) {
        ThemeService.applyTheme(theme);
    }

    /**
     *
     * @param {(Message|Object)} message
     * @param {Function} closure
     * @return {Promise}
     * @private
     */
    _messageSendPlugin(message, closure) {
        if(message.type === 'popup.status.get') {
            return new Promise((resolve, reject) => {
                this._getPopupStatus().then(resolve).catch(reject);
            });
        }
        if(message.type === 'popup.status.set') {
            return new Promise((resolve) => {
                resolve(new Message());
            });
        }
        if(message.type === 'popup.settings.open') {
            return new Promise((resolve) => {
                resolve(new Message());
            });
        }
        if(message.type === 'password.related' || message.type === 'password.search') {
            return new Promise((resolve) => {
                resolve(this._getPasswordItems());
            });
        }
        if(message.type === 'password.generate') {
            return new Promise((resolve) => {
                setTimeout(() => {
                    let text = LocalisationService.translate('DemoText');
                    resolve(new Message({payload: {success: true, password: text, words: [text]}}));
                }, 2000);
            });
        }
        if(message.type === 'server.list') {
            return new Promise((resolve) => {
                resolve(this._getServerItems());
            });
        }
        if(message.type === 'server.info') {
            return new Promise((resolve) => {
                resolve(this._getServerInfo());
            });
        }
        if(message.type === 'server.reload') {
            return new Promise((resolve) => {
                setTimeout(() => {resolve(new Message().setPayload(true));}, 3000);
            });
        }
        if(message.type === 'folder.list') {
            return new Promise((resolve) => {
                resolve(this._listFolder(message));
            });
        }
        if(message.type === 'folder.show') {
            return new Promise((resolve) => {
                resolve(this._showFolder(message));
            });
        }
        if(message.type === 'queue.fetch') {
            return new Promise((resolve) => {
                resolve(this._queueFetch(message));
            });
        }
        if(message.type === 'queue.consume') {
            return new Promise((resolve) => {
                resolve(this._queueConsume(message));
            });
        }

        return closure.call(MessageService, message);
    }

    /**
     * @return {Promise<Message>}
     * @private
     */
    async _getPopupStatus() {
        let info = await SystemService.getBrowserInfo();

        let payload = {
            tab       : 'search',
            search    : {
                query: 'demo'
            },
            browse    : {
                server: null,
                info  : false,
                folder: null
            },
            collected : {
                current: null
            },
            device    : info.device,
            authorized: true
        };


        return new Message()
            .setType('popup.data')
            .setPayload(payload);
    }

    /**
     * @return {Message}
     * @private
     */
    _getPasswordItems() {
        let passwords = this._getDemoPasswords();

        return new Message().setType('password.items')
            .setPayload(passwords);
    }

    /**
     * @return {Message}
     * @private
     */
    _getServerItems() {
        let servers = this._getDemoServers();

        return new Message().setType('server.items')
            .setPayload(servers);
    }

    /**
     * @return {Message}
     * @private
     */
    _getServerInfo() {
        let payload = {passwords: 111, folders: 33, tags: 22};

        return new Message().setPayload(payload);
    }

    /**
     * @return {Message}
     * @private
     */
    _listFolder(message) {
        let id        = message.payload.folder,
            passwords = this._getDemoPasswords(id),
            folders   = this._getDemoFolders(id);

        return new Message().setType('folder.items').setPayload({passwords, folders});
    }

    /**
     * @return {Message}
     * @private
     */
    _showFolder(message) {
        let label = LocalisationService.translate('DemoText');

        let folder = new Folder(
            {
                label,
                id      : message.payload,
                parent  : '00000000-0000-0000-0000-000000000000',
                revision: '00000000-0000-0000-0000-000000000000'
            }
        );

        return new Message().setType('folder.item').setPayload(folder);
    }

    /**
     * @return {Message}
     * @private
     */
    _queueFetch(message) {
        let items = [];
        if(message.payload.name === 'mining') {
            items.push(this._getDemoMiningItem());
        }

        return new Message()
            .setType('queue.items')
            .setPayload({name: message.payload.name, items});
    }

    /**
     * @param {Object} message
     * @return {Message}
     * @private
     */
    _queueConsume(message) {
        if(message.payload.name === 'mining') {
            let realItems = message.payload.items,
                items     = [];

            for(let item of realItems) {
                let data = item.toJSON();
                data.accepted = false;
                data.feedback = 'demo';
                items.push(data);
            }

            setTimeout(() => {
                MessageService.sendLocal({type: 'queue.items', payload: {name: 'mining', items}});
            }, 100);
        }

        return new Promise(resolve => { resolve(); });
    }

    /**
     *
     * @param {Message} message
     * @return {Message}
     * @private
     */
    _replaceQueueItems(message) {
        let payload = message.getPayload(),
            items   = [];

        if(payload.name === 'mining') {
            if(payload.items.length !== 0 && payload.items[0].id === 'min-1') {
                items = payload.items;
            } else {
                items.push(this._getDemoMiningItem().toJSON());
            }
        }

        payload.items = items;
        return message.setPayload(payload);
    }

    /**
     * @param parent
     * @return {Folder[]}
     * @private
     */
    _getDemoFolders(parent) {
        let label = LocalisationService.translate('DemoText');

        return [
            new Folder({id: 'fld-1', parent, label}),
            new Folder({id: 'fld-2', parent, label})
        ];
    }

    /**
     * @param folder
     * @return {Password[]}
     * @private
     */
    _getDemoPasswords(folder = '00000000-0000-0000-0000-000000000000') {
        let label = LocalisationService.translate('DemoText');

        return [
            new Password({id: 'pwd-1', label, username: label, password: label, notes: label, url: 'https://example.com', customFields: [], folder, hidden:false, status: 0, created: new Date(), edited: new Date()}),
            new Password({id: 'pwd-2', label, username: label, password: label, notes: label, url: 'https://example.com', customFields: [], folder, hidden: false, status: 2, created: new Date(), edited: new Date()})
        ];
    }

    /**
     * @return {Server[]}
     * @private
     */
    _getDemoServers() {
        let label = LocalisationService.translate('DemoText');

        return [
            new Server({id: 'srv-1', label, user: 'user', token: '', baseUrl: 'https://www.example.com'}),
            new Server({id: 'stv-2', label, user: 'user', token: '', baseUrl: 'https://www.example.com'})
        ];
    }

    /**
     * @return {MiningItem}
     * @private
     */
    _getDemoMiningItem() {
        let label = LocalisationService.translate('DemoText');
        return new MiningItem()
            .setId('min-1')
            .setTaskNew(true)
            .setTaskField('label', label)
            .setTaskField('username', 'username')
            .setTaskField('password', 'password')
            .setTaskField('url', 'https://www.example.com')
            .setTaskField('hidden', false);
    }
}

export default new Preview();