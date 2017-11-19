import API from '@js/Helper/api';
import Utility from "@js/Classes/Utility"

browser.runtime.getBrowserInfo()
    .then((data) => {
        if (data.version === '56.0.2') {
            browser.browserAction.setIcon(
                {path: "/img/passwords-dark.svg"}
            );
        }
    });

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

                if (entry.user === password.user && entry.host === password.host) {
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
            title  : Utility.translate('New login detected'),
            message: Utility.translate('Click to save password', [minedPassword.user])
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
                    title  : Utility.translate('Password saved'),
                    message: Utility.translate('Password stored sucessfully')
                }
            );
            minedPassword = null;
        })
        .catch(() => {
            browser.notifications.create(
                'ncp-pwd-failed',
                {
                    type   : 'basic',
                    title  : Utility.translate('Save password failed'),
                    message: Utility.translate('Unable to save password')
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
            title  : Utility.translate('Updated login detected'),
            message: Utility.translate('Click to update password', [minedPassword.user])
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
                title  : Utility.translate('Password updated'),
                message: Utility.translate('Password updated sucessfully')
            }
        );
        minedPassword = null;
    }).catch(() => {
        browser.notifications.create(
            'ncp-pwd-failed',
            {
                type   : 'basic',
                title  : Utility.translate('Update password failed'),
                message: Utility.translate('Unable to update password')
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
