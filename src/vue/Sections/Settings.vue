<template>
    <form id="settings" class="settings" v-on:submit="saveSettings($event)">
        <div>
            <label for="settings-theme">
                <translate>DarkMode</translate>
            </label>
            <input id="settings-theme" type="checkbox" v-model="theme">
        </div>
        <div>
            <label for="settings-url">
                <translate>Url</translate>
            </label>
            <input id="settings-url" type="text" v-model="url" placeholder="https://nextcloud.example.com">
        </div>
        <div>
            <label for="settings-user">
                <translate>User</translate>
            </label>
            <input id="settings-user" type="text" v-model="user" placeholder="user">
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
    import Utility from '@js/Classes/Utility';
    import Translate from '@vue/Partials/Translate.vue';
    import FirefoxInput from '@vue/Partials/FirefoxInput.vue';

    export default {
        data() {
            return {
                url        : '',
                user       : '',
                theme      : false,
                password   : '',
                firefoxHack: process.env.BUILD_TARGET === 'firefox' && navigator.platform.indexOf('Linux') !== -1
            };
        },
        components: {
            Translate,
            FirefoxInput
        },

        created() {
            browser.storage.sync.get(
                ['url', 'user', 'theme']
            ).then((data) => {
                this.url = data.url;
                this.user = data.user;
                this.theme = data.theme === 'dark';
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
                let url   = this.url,
                    theme = this.theme ? 'dark':'auto';
                url = url.replace(/([\/]*)$/g, '');

                if(!this.isValidURL(url)) {
                    if(confirm(Utility.translate('SettingsInvalidUrl', [this.url]))) {
                        this.url = '';
                        browser.storage.local.set({initialized: false});
                        return;
                    }
                }

                browser.storage.sync.set(
                    {
                        url  : url,
                        theme: theme,
                        user : this.user
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
            },
            isValidURL(str) {
                let a = document.createElement('a');
                a.href = str;
                return (a.host && a.host !== window.location.host) &&
                       str.indexOf('/index.php') === -1 &&
                       str.indexOf('/passwords') === -1 &&
                       str.indexOf('/apps') === -1;
            }
        }
    };
</script>

<style lang="scss">
    form.settings {
        padding          : 5px;
        margin           : 0;
        background-color : var(--color-fg);
        color            : var(--color-bg);

        > div {
            position : relative;
        }

        label {
            display : block;
            padding : 0 0 5px;

            &[for=settings-theme] {
                cursor : pointer;
            }
        }

        input,
        button {
            width            : 100%;
            box-sizing       : border-box;
            padding          : 5px;
            font-size        : 12pt;
            margin-bottom    : 15px;
            background-color : var(--color-fg);
            color            : var(--color-bg);
            border           : 1px solid var(--color-bg);
            border-radius    : 3px;

            &#settings-theme {
                width    : auto;
                position : absolute;
                top      : 0;
                right    : 0;
                cursor   : pointer;
            }
        }

        button {
            margin-bottom : 0;
            padding       : 10px;
        }
    }
</style>