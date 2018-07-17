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
            <input id="settings-password" type="text" :value="password" autocomplete="off">
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

    export default {
        data() {
            return {
                url     : '',
                user    : '',
                password: ''
            };
        },
        components: {
            Translate
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
                this.password = ''.padStart(data.password.length, ' ');
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

                let password = $('#settings-password').val();
                if(password.trim().length !== 0) {
                    browser.storage.local.set(
                        {
                            password   : password,
                            initialized: true
                        }
                    );
                }

                let runtime = browser.runtime.getBrowserInfo ? browser.runtime:chrome.runtime;
                runtime.sendMessage(runtime.id, {type: 'reload'});
            }
        }
    };
</script>

<style lang="scss">
    @font-face {
        font-family : "fakepasswordfont";
        src         : url("data:font/woff;base64,d09GMgABAAAAAAT0AAoAAAAAXSQAAASmAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAABmAAizQKgYcY6B0LiQwAATYCJAOJCAQgBZIbByAbbUgRxbQh++qAN0RNf0R4GR96WBPG9Qg1qlPt6SdGBMRCl4LnaX//v/bMvoDnfUERQFMCXH8SQwETGR2KfBDcthQf0v+ggt1iyYIN7nZs0GwXYAqLQkx0+/NNOKH/Sqz+5wKH7D/O/TtwT+jBESaFIX0Gm9INlIKlCSM3n9qv5d2TzeDVHl7S1cTs8r/fJUQ0XcTOvKEh0bjpJEsmmawlkEm066RMJRRtiVCi2JabFbe8AEF02HoJ+AkwihzChxoMAIt3zEB3HjRAAYBNkBgCYQCAURMmjmcI7o9fAVAA5A9AUQAHgAEskMUiYD6i5gngcCiwAU+WySq547Ku7pxr5lq5fu5iU7M/+sfvAY5jkqySTS7ril8tfSkf1+B9cMsEk/2X77756pM3evNrVX8FYfWgKCr/pz0gzRAwI0BaQKYV1IYDAG0A8AEgU1U7T9iAplrdCyTMuC3KlOMXcBUAwnsGXGVpKBNM7Jl8ZfOUF9k76bBposIPzd6q6267RuU+HyjTvje8ewC8gDvEbSFCLAxQb8gUAHC+DUnXlM6dHB63Vs5JDPgWRAF43S+NOJr6riOIAUsQV/B9bPnbaByAzmMNwe3tICDNKOADwLCq4WQHQkcZrhCaUYYhwABYOjIcSjuWw0eEI/DTjFMIMIDbCJIXixARKSHMOmmBKBPlKGJ0lK+I09U0lWZoa8afQiBq1mIRDQE9zM4WhBHmCgxx48Ey3cagTLRL4CNvr8DPCPsUAVZpDkE66H6EyOslhPmpjxHlrO+IMd2/DHHm+++WZhgfaJ9GoBhYT1ywnlQND0KJCCL5FtQsgmlBrh4Np1DgNNBSzky0w55xlzXlHCPgQX51QqVE7ZSTZ1NmZ5RRRpmn+X06oGR45pk39B3eneDjcspYnoeBo6E6ZtDhKowgLhgoPN0iyX8WbvrvKvbjYRnXjrPTsxk56nHBo8ZTk2QrPyH7zaq0ykVu1fxbzOOW63GGZteZnOa99hy7LEq5nVNOOeUyEaZE1Naxt5dR6tRxk7r2q20rXEgy3PngZt0TbCEWazQ9PeURGU3z7KLs7Ky0LOOsYFGqfX1eVm0+oDV9xLBhKVdU1PxeuitxuMrH5ft3ewxr42mSEkG9JZ4QKUkkNPmNTO6dBWjE57GNMbWv1yoFwcLwGrDQIgUiRQtAMEbRLSJNeiXvcF50J/KrXotgRvjlYwHp5EfEC/S39JBLZG3GHDPGGGPMvxeI73IgZNorNcig5HXAEODQnROQnqwYFpx0CU2MShHxWUo9ODKoHFOiyPoilSKJDAjWIlEzBmnEWPB44clu8RIs4JtAZaL14tC/54ztHBQURGo0tyArqLs062Dji1d46heIppNGAi7utgapt7GUYHJWr3dWDm5rNBKp2nma/y8SpswGqUAxFqlc5oPP3nvns9RTGXfMGWfczivZ49G6kTYjsGdmDmaL++PtycC1SaWn1WAfkFXSfNZGmrcekciH42PVZkTXAyPBuVJK2XZkM8hK/Z3wjDRJdaUO8W5f0SRwJqVaB2+TMORBtdXGC6Blok3HYAtsut5fSOO3ReeKcGglPVp8991zwPfWCgA=");
    }

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

        #settings-password {
            font-family    : "fakepasswordfont", "Windings", sans-serif;
            font-size      : 0.5em;
            letter-spacing : -0.75em
        }
    }
</style>