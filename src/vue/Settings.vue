<template>
    <form id="settings" class="settings" v-on:submit="saveSettings($event)">
        <div>
            <label for="settings-url">URL</label>
            <input id="settings-url" type="text" :value="url">
        </div>
        <div>
            <label for="settings-user">User</label>
            <input id="settings-user" type="text" :value="user">
        </div>
        <div>
            <label for="settings-password">Password</label>
            <input id="settings-password" type="password" :value="password">
        </div>
        <br>
        <div>
            <input type="submit" value="Save">
        </div>
    </form>
</template>

<script>
    import $ from "jquery";

    export default {
        data() {
            return {
                url     : 'https://nextcloud.example.com/',
                user    : '',
                password: '',
            }
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
                browser.storage.sync.set(
                    {
                        url : $('#settings-url').val(),
                        user: $('#settings-user').val()
                    }
                );
                browser.storage.local.set(
                    {
                        password   : $('#settings-password').val(),
                        initialized: true
                    }
                );
                vm.parent.page = 'logins';
                vm.parent.apiLogin();
            }
        }
    }
</script>

<style lang="scss">
    form.settings {
        padding : 5px;

        label {
            display: block;
            padding: 10px 0 5px;
        }

        input {
            width      : 240px;
            box-sizing : border-box;
        }

        input[type=submit] {

            &:hover {
                background-color: #0082c9;
                color: #fff;
                cursor: pointer;
            }
        }
    }
</style>