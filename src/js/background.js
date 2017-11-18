import API from '@js/Helper/api';

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