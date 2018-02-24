<template>
    <div id="manager">
        <i class="fa fa-refresh btn reload fa-fw" @click="apiLogin"></i>
        <banner></banner>
        <tabs :tabs="{related: 'key', search:'search', settings: 'gear'}" uuid="main-tabs" :current="currentTab">
            <div slot="related">
                <related></related>
            </div>
            <div slot="search">
                <search></search>
            </div>
            <div slot="settings">
                <settings></settings>
            </div>
        </tabs>
    </div>
</template>

<script>
    import $ from "jquery";
    import API from '@js/Helper/api';
    import Tabs from '@vue/Partials/Tabs.vue';
    import Banner from '@vue/Partials/Banner.vue';
    import Search from '@vue/Sections/Search.vue';
    import Related from '@vue/Sections/Related.vue';
    import Settings from '@vue/Sections/Settings.vue';

    export default {
        el        : '#manager',
        components: {
            Tabs,
            Banner,
            Search,
            Related,
            Settings
        },

        data() {
            return {
                currentTab: 'related',
                updating  : false,
            }
        },

        created() {
            browser.runtime.getPlatformInfo().then(
                (data) => {
                    if (data.os === 'android') $('body').addClass('mobile');
                });

            browser.storage.local.get(
                ['initialized']
            ).then((data) => {
                if (!data.initialized) {
                    this.currentTab = 'settings';
                } else {
                    this.apiLogin();
                }
            });
            browser.storage.onChanged.addListener(this.apiLogin);
        },

        methods: {
            apiLogin: function () {
                if (this.updating) return;
                this.updating = true;

                let $reload = $('.btn.reload');
                $reload.addClass('fa-spin');
                browser.storage.sync.get(['url', 'user']).then((sync) => {
                    browser.storage.local.get(['password']).then((local) => {
                        API.login(sync.url, sync.user, local.password)
                            .then(() => {
                                this.updating = false;
                                $reload.removeClass('fa-spin');
                            })
                            .catch(() => {
                                this.updating = false;
                                $reload.removeClass('fa-spin');
                            })
                    })
                });
            }
        }
    }
</script>

<style lang="scss">
    @import "~font-awesome/css/font-awesome.min.css";

    body {
        margin    : 0;
        font-size : 12pt;
        width     : 300px;
        font-family: sans-serif;
    }

    .btn {
        position : absolute;
        cursor   : pointer;
        top      : 5px;
        right    : 5px;
        z-index  : 2;
        color    : #fff;
    }

    body.mobile {
        width : 100%;
    }
</style>
