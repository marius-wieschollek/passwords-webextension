<template>
    <form id="settings" class="settings" v-on:submit="saveSettings($event)">
        <div>
            <label for="settings-url">URL</label>
            <br>
            <input id="settings-url" type="text" :value="url">
        </div>
        <div>
            <label for="settings-user">User</label>
            <br>
            <input id="settings-user" type="text" :value="user">
        </div>
        <div>
            <label for="settings-password">Password</label>
            <br>
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

        components: {},

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
                        password: $('#settings-password').val(),
                        initialized: true
                    }
                );
                vm.parent.page = 'accounts';
            }
        }
    }
</script>

<style lang="scss">
    .settings {
        padding : 5px;

        input {
            width      : 240px;
            box-sizing : border-box;
        }
    }
</style>