import BaseApi from '@js/Classes/LegacyApi';
import Utility from "@js/Classes/Utility";

class Api {

    constructor(endpoint, user, password) {
        this._api = new BaseApi(endpoint, user, password, null, true);
    }

    async login(endpoint, user, password) {
        this._api.login(endpoint, user, password);
        await this.reloadPasswords();
    }

    savePassword(user, password, title = null, website = null) {
        return new Promise((resolve, reject) => {
            this._api.createPassword(
                {
                    loginname: user,
                    pass     : password,
                    website  : title,
                    address  : website
                }
            ).then(() => {
                this.reloadPasswords();
                resolve();
            }).catch((e) => { reject(e); });
        });
    }

    updatePassword(id, user, password, title = null, website = null, notes = null, category = 0) {
        return new Promise((resolve, reject) => {
            let date = new Date();
            this._api.updatePassword(
                {
                    id         : id,
                    loginname  : user,
                    pass       : password,
                    website    : title,
                    address    : website,
                    notes      : notes,
                    category   : category,
                    datechanged: date.getFullYear() + '-' + date.getMonth() + '-' + date.getDate()

                }
            ).then(() => {
                this.reloadPasswords();
                resolve();
            }).catch((e) => { reject(e); });
        });
    }

    reloadPasswords() {
        return new Promise((resolve, reject) => {
            this._api.listPasswords().then((data) => {

                let passwords = [];
                for (let i in data) {
                    if (!data.hasOwnProperty(i) || data[i].deleted) continue;
                    let p = data[i],
                        d = JSON.parse('{' + p.properties + '}');

                    let host = p.website;
                    if (d.address && d.address !== 'undefined') {
                        host = Utility.analyzeUrl(d.address, 'hostname');
                    }

                    passwords.push(
                        {
                            id      : p.id,
                            title   : d.loginname,
                            host    : host,
                            user    : d.loginname,
                            password: p.pass,
                            notes   : d.notes,
                            category: d.category
                        }
                    );
                }

                browser.storage.local.set({'database': passwords})
                    .then(() => {resolve(passwords)})
                    .catch((e) => {reject(e)});
            }).catch((e) => {
                let message = e.message ? e.message:e.statusText;
                browser.notifications.create(
                    'api-request-failed',
                    {
                        type   : 'basic',
                        title  : Utility.translate('PasswordRequestFailedTitle'),
                        message: Utility.translate('PasswordRequestFailedText', [message])
                    }
                );

                reject(e)
            });
        });
    }

    getPasswords() {
        return new Promise((resolve, reject) => {
            browser.storage.local.get(['database'])
                .then((data) => { resolve(data.database); })
                .catch((data) => { reject(data); })
        });
    }
}


const api = new Api(null, null, null);

export default api;