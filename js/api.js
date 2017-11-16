import BaseApi from '@js/Classes/LegacyApi';

class Api {

    constructor(endpoint, user, password) {
        this._api = new BaseApi(endpoint, user, password, null, true);
        this._passwords = {};
    }

    async login(endpoint, user, password) {
        this._api.login(endpoint, user, password);
        await this.reloadPasswords();
    }

    reloadPasswords() {
        return new Promise((resolve, reject) => {
            this._api.listPasswords().then((data) => {

                let passwords = [];
                for (let i in data) {
                    if(!data.hasOwnProperty(i)) continue;
                    let p = data[i],
                        d = JSON.parse('{' + p.properties + '}');

                    let website = p.website;
                    if(d.address && d.address !== 'undefined') {
                        let el = document.createElement ('a');
                        el.href = d.address;
                        website = el.hostname;
                    }


                    passwords.push(
                        {
                            'website' : website,
                            'user'    : d.loginname,
                            'password': p.pass
                        }
                    );
                }

                browser.storage.local.set({'database': passwords})
                    .then(() => {resolve(passwords)})
                    .catch((e) => {reject(e)});
            }).catch((e) => {reject(e)});
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