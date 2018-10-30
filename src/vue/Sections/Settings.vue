<template>
    <form id="settings" class="settings" v-on:submit="saveSettings($event)">
        <div>
            <label for="settings-url">
                <translate>Url</translate>
            </label>
            <input id="settings-url" type="text" :value="url" placeholder="https://nextcloud.example.com">
        </div>
        <div>
            <label for="settings-user">
                <translate>User</translate>
            </label>
            <input id="settings-user" type="text" :value="user" placeholder="user">
        </div>
        <div>
            <label for="settings-password">
                <translate>Password</translate>
            </label>
            <firefox-input id="settings-password" v-model="password" autocomplete="off" v-if="firefoxHack"/>
            <input id="settings-password" type="password" v-model="password" v-else>
        </div>
        <br>
        <div>
            <button class="theme-button-invert" type="submit">
                <translate>Save</translate>
            </button>
        </div>
    </form>
</template>

<script>
    import $ from "jquery";
    import Translate from '@vue/Partials/Translate.vue';
    import FirefoxInput from '@vue/Partials/FirefoxInput.vue';

    export default {
        data() {
            return {
                url        : '',
                user       : '',
                password   : '',
                firefoxHack: process.env.BUILD_TARGET === 'firefox'
            };
        },
        components: {
            Translate,
            FirefoxInput
        },

        created() {
            browser.storage.sync.get(
                ['url', 'user']
            ).then((data) => {
                this.url = data.url;
                this.user = data.user;
            });
            browser.storage.local.get(
                ['password']
            ).then((data) => {
                this.password = data.password;
            });
        },

        methods: {
            saveSettings($e) {
                $e.stopPropagation();
                let url = $('#settings-url').val();
                url = url.replace(/([\/]*)$/g, '');

                browser.storage.sync.set(
                    {
                        url : url,
                        user: $('#settings-user').val()
                    }
                );

                browser.storage.local.set(
                    {
                        password   : this.password,
                        initialized: true
                    }
                );

                let runtime = browser.runtime.getBrowserInfo ? browser.runtime:chrome.runtime;
                runtime.sendMessage(runtime.id, {type: 'reload'});
            }
        }
    };
</script>

<style lang="scss">
    form.settings {
        padding : 5px;
        margin  : 0;

        label {
            display : block;
            padding : 0 0 5px;
        }

        input,
        button {
            width         : 100%;
            box-sizing    : border-box;
            padding       : 5px;
            font-size     : 12pt;
            margin-bottom : 15px;
        }

        button {
            margin-bottom : 0;
            padding       : 10px;
        }
    }
</style>