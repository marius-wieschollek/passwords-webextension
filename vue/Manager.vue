<template>
    <div id="manager">
        <i class="fa fa-refresh btn reload fa-fw" @click="apiLogin"></i>
        <i class="fa fa-cog btn settings" @click="toggleSettings"></i>
        <banner url="https://nextcloud.mdns.eu"></banner>
        <div class="accounts" v-if="page == 'accounts'">
            <account v-for="account in accounts" :account="account"></account>
            <div v-if="accounts.length == 0" class="no-accounts">
                No accounts for this website
            </div>
        </div>
        <settings v-if="page == 'settings'"></settings>
    </div>
</template>

<script>
    import Vue from 'vue';
    import $ from "jquery";
    import API from '@js/api';
    import Banner from '@vue/Banner.vue';
    import Account from '@vue/Account.vue';
    import Settings from '@vue/Settings.vue';

    export default {
        el        : '#manager',
        components: {
            Banner,
            Account,
            Settings
        },

        data() {
            return {
                page    : 'accounts',
                accounts: []
            }
        },


        created() {
            browser.storage.local.get(
                ['initialized']
            ).then((data) => {
                if (!data.initialized) {
                    this.page = 'settings';
                } else {
                    this.apiLogin();
                }
            });
        },

        methods: {
            toggleSettings: function () {
                this.page = this.page === 'settings' ? 'accounts':'settings';
            },
            apiLogin      : function () {
                let $reload = $('.btn.reload');
                $reload.addClass('fa-spin');
                browser.storage.sync.get(['url', 'user']).then((sync) => {
                    browser.storage.local.get(['password']).then((local) => {
                        API.login(sync.url, sync.user, local.password).then(() => {
                            API.getPasswords().then((d) => {
                                this.loadPasswords(d);
                                $reload.removeClass('fa-spin');
                            });
                        })
                    })
                });
            },
            loadPasswords : function (database) {
                browser.tabs.query({currentWindow: true, active: true}).then((tabs) => {

                    let accounts = [];
                    let el = document.createElement('a');
                    el.href = tabs[0].url;
                    let host = el.hostname;

                    if ((host.match(/\./g) || []).length > 1) {
                        //host = host.substring(host.indexOf('.')+1);
                    }

                    for (let i = 0; i < database.length; i++) {
                        let entry = database[i];

                        if (entry.website.indexOf(host) !== -1) {
                            accounts.push(entry);
                        }

                    }
                    this.accounts = accounts;
                });
            }
        }
    }
</script>

<style lang="scss">
    @import "~font-awesome/css/font-awesome.min.css";

    body {
        margin : 0
    }

    .btn {
        position : absolute;
        cursor   : pointer;
        top      : 5px;
        right    : 5px;
        z-index  : 2;
        color    : #fff
    }

    .btn.reload {
        right : 25px;
    }

    .no-accounts {
        padding: 5px;
        text-align: center;
    }
</style>
