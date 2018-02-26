<template>
    <div class="logins">
        <login v-for="(login, i) in accounts" :key="i" :login="login" :autoclose="true"/>
        <div v-if="accounts.length === 0" class="no-accounts theme-invert">
            <translate>NoRelatedMatches</translate>
        </div>
    </div>
</template>

<script>
    import Utility from "@js/Classes/Utility";
    import Login from '@vue/Partials/Login.vue';
    import Translate from '@vue/Partials/Translate.vue';

    export default {
        components: {
            Login,
            Translate
        },

        data() {
            return {
                accounts: []
            }
        },

        created() {
            browser.storage.local.get(
                ['initialized']
            ).then((data) => {
                if (data.initialized) {
                    this.loadPasswords();
                }
            });
            browser.storage.onChanged.addListener(this.loadPasswords);
            browser.tabs.onActivated.addListener(this.loadPasswords);
            browser.tabs.onCreated.addListener(this.loadPasswords);
            browser.tabs.onUpdated.addListener(this.loadPasswords);
            browser.tabs.onReplaced.addListener(this.loadPasswords);
        },

        methods: {
            loadPasswords   : function () {
                let runtime = browser.runtime.getBrowserInfo ? browser.runtime:chrome.runtime;
                runtime
                    .sendMessage(runtime.id, {type: 'passwords'})
                    .then(this.processPasswords);
            },
            processPasswords: function (passwords) {
                if(!passwords) return;
                browser.tabs.query({currentWindow: true, active: true}).then((tabs) => {
                    let accounts = [];
                    let host = Utility.analyzeUrl(tabs[0].url, 'hostname');

                    if (host.length === 0) {
                        this.accounts = [];
                        return;
                    }

                    for (let i = 0; i < passwords.length; i++) {
                        let entry = passwords[i];

                        if (Utility.hostCompare(entry.host, host)) {
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
    .no-accounts {
        padding    : 10px;
        text-align : center;
    }
</style>