import API from '@js/Helper/api';
import Utility from "@js/Classes/Utility"

let isChrome = !browser.runtime.getBrowserInfo;
if (!isChrome) {
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
        if (data.initialized) apiLogin()
    });


browser.storage.sync.set({version: 10500});
browser.storage.local.set({version: 10500});

async function apiLogin() {
    let sync = await browser.storage.sync.get(['url', 'user', 'theme']),
        local = await browser.storage.local.get(['password']),
        path = isChrome ? '/img/passwords-32.png':'/img/passwords-dark.svg';

    if(sync.theme === 'dark') path = isChrome ? '/img/passwords-light-32.png':'/img/passwords-light.svg';
    browser.browserAction.setIcon({path});

    await API.login(sync.url, sync.user, local.password);
}


browser.storage.local.get(['database'])
    .then((data) => {
        if (data.database) browser.storage.local.remove(['database']);
    });

let minedPassword = null;

function checkMinedPassword(password) {
    browser.storage.local.get(['initialized'])
        .then((data) => {
            if (!data.initialized) return;

            password.host = Utility.analyzeUrl(password.url, 'hostname');

            minedPassword = password;
            notificationCleanup();

            let passwords = API.getPasswords();
            for (let i = 0; i < passwords.length; i++) {
                let entry = passwords[i];

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
            iconUrl: 'img/passwords-48.png',
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
                    iconUrl: 'img/passwords-48.png',
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
                    iconUrl: 'img/passwords-48.png',
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
            iconUrl: 'img/passwords-48.png',
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
                iconUrl: 'img/passwords-48.png',
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
                iconUrl: 'img/passwords-48.png',
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

if(isChrome) {
    chrome.runtime.onMessage.addListener(processMessage);
} else {
    browser.runtime.onMessage.addListener(processMessage);
}

function processMessage(msg, sender, sendResponse) {
    if (msg.type === 'mine-password') checkMinedPassword(msg);
    if (msg.type === 'passwords') sendResponse(API.getPasswords());
    if (msg.type === 'reload') {
        apiLogin().then(() => { if(!isChrome) sendResponse(true); });
        return true;
    }
}

browser.tabs.onActivated.addListener(updatePasswordMenu);
browser.tabs.onCreated.addListener(updatePasswordMenu);
browser.tabs.onUpdated.addListener(updatePasswordMenu);
browser.tabs.onReplaced.addListener(updatePasswordMenu);
browser.storage.onChanged.addListener(updatePasswordMenu);

let contextMenuAccounts = [];

function updatePasswordMenu() {
    isChrome ? browser.contextMenus.removeAll():browser.menus.removeAll();
    contextMenuAccounts = [];

    browser.tabs.query({currentWindow: true, active: true}).then((tabs) => {
        if (!tabs[0]) return;
        browser.browserAction.setBadgeText({text: '', tabId: tabs[0].id});
        let host = Utility.analyzeUrl(tabs[0].url, 'hostname');
        if (host.length === 0) return;

        let passwords = API.getPasswords();
        if (!passwords) return;
        let isChrome = !browser.runtime.getBrowserInfo,
            menus    = isChrome ? browser.contextMenus:browser.menus;

        contextMenuAccounts = [];
        for (let i = 0; i < passwords.length; i++) {
            let entry = passwords[i];

            if (Utility.hostCompare(entry.host, host)) {
                contextMenuAccounts.push(entry);
            }
        }

        let size = contextMenuAccounts.length;
        if (size === 0) {
            if (!isChrome) {
                menus.create(
                    {
                        id      : 'open-browser-action',
                        icons   : {16: 'img/passwords-dark.svg'},
                        title   : Utility.translate('contextMenuTitle'),
                        contexts: ['page', 'password', 'editable'],
                        command : "_execute_browser_action"
                    }
                );
            }

            return;
        }

        browser.browserAction.setBadgeText({text: size.toString(), tabId: tabs[0].id});
        if(process.env.BUILD_TARGET === 'firefox') browser.browserAction.setBadgeTextColor({color: '#ffffff'});
        browser.browserAction.setBadgeBackgroundColor({color: '#0082c9'});
        let menuId = 'context-menu-' + Math.round(Math.random() * 10000);
        if (isChrome) {
            menus.create(
                {
                    id      : menuId,
                    title   : Utility.translate('contextMenuTitle'),
                    contexts: ['page', 'browser_action', 'editable'],
                }
            );
        } else {
            menus.create(
                {
                    id      : menuId,
                    icons   : {16: 'img/passwords-dark.svg'},
                    title   : Utility.translate('contextMenuTitle'),
                    contexts: ['page', 'browser_action', 'password'],
                    command : "_execute_browser_action"
                }
            );
        }

        for (let i = 0; i < contextMenuAccounts.length; i++) {
            let entry = contextMenuAccounts[i],
                id    = 'ncp-pwd-' + Math.round(Math.random() * 10000) + '_' + i;

            if (isChrome) {
                menus.create(
                    {
                        parentId: menuId,
                        id      : id,
                        title   : entry.user,
                        contexts: ['page', 'browser_action', 'editable'],
                        onclick : insertContextMenuPassword
                    }
                );
            } else {
                menus.create(
                    {
                        parentId: menuId,
                        id      : id,
                        icons   : {16: 'https://icons.duckduckgo.com/ip2/' + entry.host + '.ico'},
                        title   : entry.user,
                        contexts: ['page', 'browser_action', 'password'],
                        onclick : insertContextMenuPassword
                    }
                );
            }
        }
    });
}

function insertContextMenuPassword(e) {
    let [, id] = e.menuItemId.split('_');
    browser.tabs.query({currentWindow: true, active: true})
        .then((tabs) => {
            browser.tabs.sendMessage(tabs[0].id, contextMenuAccounts[id])
                .catch((e) => {console.error(e);});
        });
}
