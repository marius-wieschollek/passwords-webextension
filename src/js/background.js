import API from '@js/Helper/api';
import Utility from "@js/Classes/Utility"

if (browser.runtime.getBrowserInfo) {
    browser.runtime.getBrowserInfo()
        .then((data) => {
            let majorVersion = data.version.substr(0, 2);
            if (data.name === 'Firefox' && (majorVersion === '56' || majorVersion === '52')) {
                browser.browserAction.setIcon(
                    {path: "/img/passwords-dark.svg"}
                );
            }
        });
}

browser.storage.local.get(['initialized'])
    .then((data) => {
        if (data.initialized) {
            apiLogin()
        }
    });

function apiLogin() {
    browser.storage.sync.get(['url', 'user']).then((sync) => {
        browser.storage.local.get(['password'])
            .then((local) => {
                API.login(sync.url, sync.user, local.password)
            })
    });
}

let minedPassword = null;

function checkMinedPassword(password) {
    browser.storage.local.get(['database', 'initialized'])
        .then((data) => {
            if (!data.initialized) return;
            password.host = Utility.analyzeUrl(password.url, 'hostname');

            minedPassword = password;
            notificationCleanup();

            for (let i = 0; i < data.database.length; i++) {
                let entry = data.database[i];

                if (entry.user === password.user && Utility.hostCompare(entry.host, password.host)) {
                    if (entry.password !== password.password) {
                        minedPassword.id = entry.id;
                        minedPassword.notes = entry.notes;
                        minedPassword.category = entry.category;
                        notifyUpdatedPassword();
                    }
                    return;
                }
            }
            notifyNewPassword();
        });
}

/**
 *
 */
function notifyNewPassword() {
    browser.notifications.create(
        'ncp-pwd-create',
        {
            type   : 'basic',
            title  : Utility.translate('NewLoginDetectedTitle'),
            message: Utility.translate('NewLoginDetectedText', [minedPassword.user])
        }
    );

    browser.notifications.onClicked.addListener(saveNewPassword);
    browser.notifications.onClosed.addListener(notificationCleanup);
}

/**
 *
 * @param notification
 */
function saveNewPassword(notification) {
    if (notification !== 'ncp-pwd-create') return;
    notificationCleanup();

    API.savePassword(minedPassword.user, minedPassword.password, minedPassword.host, minedPassword.url)
        .then(() => {
            browser.notifications.create(
                'ncp-pwd-saved',
                {
                    type   : 'basic',
                    title  : Utility.translate('PasswordCreatedTitle'),
                    message: Utility.translate('PasswordCreatedText')
                }
            );
            minedPassword = null;
        })
        .catch(() => {
            browser.notifications.create(
                'ncp-pwd-failed',
                {
                    type   : 'basic',
                    title  : Utility.translate('CreatePasswordFailedTitle'),
                    message: Utility.translate('CreatePasswordFailedText')
                }
            );
            minedPassword = null;
        });
}

/**
 *
 */
function notifyUpdatedPassword() {
    browser.notifications.create(
        'ncp-pwd-update',
        {
            type   : 'basic',
            title  : Utility.translate('UpdatedLoginDetectedTitle'),
            message: Utility.translate('UpdatedLoginDetectedText', [minedPassword.user])
        }
    );

    browser.notifications.onClicked.addListener(saveUpdatedPassword);
    browser.notifications.onClosed.addListener(notificationCleanup);
}

/**
 *
 * @param notification
 */
function saveUpdatedPassword(notification) {
    if (notification !== 'ncp-pwd-update') return;
    notificationCleanup();

    API.updatePassword(
        minedPassword.id,
        minedPassword.user,
        minedPassword.password,
        minedPassword.host,
        minedPassword.url,
        minedPassword.notes,
        minedPassword.category
    ).then(() => {
        browser.notifications.create(
            'ncp-pwd-updated',
            {
                type   : 'basic',
                title  : Utility.translate('PasswordUpdatedTitle'),
                message: Utility.translate('PasswordUpdatedText')
            }
        );
        minedPassword = null;
    }).catch(() => {
        browser.notifications.create(
            'ncp-pwd-failed',
            {
                type   : 'basic',
                title  : Utility.translate('UpdatePasswordFailedTitle'),
                message: Utility.translate('UpdatePasswordFailedText')
            }
        );
        minedPassword = null;
    });
}

function notificationCleanup() {
    browser.notifications.clear('ncp-pwd-saved');
    browser.notifications.clear('ncp-pwd-create');
    browser.notifications.clear('ncp-pwd-update');
    browser.notifications.clear('ncp-pwd-failed');
    browser.notifications.clear('ncp-pwd-updated');
    browser.notifications.onClicked.removeListener(saveNewPassword);
    browser.notifications.onClosed.removeListener(notificationCleanup);
}

browser.runtime.onMessage.addListener(processMessage);

function processMessage(msg) {
    if (msg.type === 'mine-password') checkMinedPassword(msg);
}

browser.tabs.onActivated.addListener(updatePasswordMenu);
browser.tabs.onCreated.addListener(updatePasswordMenu);
browser.tabs.onUpdated.addListener(updatePasswordMenu);
browser.tabs.onReplaced.addListener(updatePasswordMenu);

let contextMenuAccounts = [];

function updatePasswordMenu() {
    if (browser.runtime.getBrowserInfo) {
        browser.menus.removeAll();
    } else {
        browser.contextMenus.removeAll();
    }
    contextMenuAccounts = [];

    browser.tabs.query({currentWindow: true, active: true}).then((tabs) => {
        let host = Utility.analyzeUrl(tabs[0].url, 'hostname');
        if (host.length === 0) return;

        API.getPasswords().then((database) => {
            if (!database) return;

            for (let i = 0; i < database.length; i++) {
                let entry = database[i];

                if (Utility.hostCompare(entry.host, host)) {
                    contextMenuAccounts.push(entry);
                }
            }

            if (contextMenuAccounts.length === 0) {
                browser.menus.create(
                    {
                        id      : 'open-browser-action',
                        icons   : {16: 'img/passwords-dark.svg'},
                        title   : Utility.translate('contextMenuTitle'),
                        contexts: ['page', 'password'],
                        command : "_execute_browser_action"
                    }
                );

                return;
            }

            browser.menus.create(
                {
                    id      : 'context-menu',
                    icons   : {16: 'img/passwords-dark.svg'},
                    title   : Utility.translate('contextMenuTitle'),
                    contexts: ['page', 'browser_action', 'password'],
                }
            );

            for (let i = 0; i < contextMenuAccounts.length; i++) {
                let entry = contextMenuAccounts[i];

                browser.menus.create(
                    {
                        parentId: 'context-menu',
                        id      : 'ncp-pwd-' + Math.round(Math.random() * 10000) + '_' + i,
                        icons   : {16: 'https://icons.duckduckgo.com/ip2/' + entry.host + '.ico'},
                        title   : entry.user,
                        contexts: ['page', 'browser_action', 'password'],
                        onclick : insertContextMenuPassword
                    }
                );
            }
        });
    });
}

function insertContextMenuPassword(e) {
    let [, id] = e.menuItemId.split('_');
    browser.tabs.query({currentWindow: true, active: true})
        .then((tabs) => {
            browser.tabs.sendMessage(tabs[0].id, contextMenuAccounts[id]);
        });
}
