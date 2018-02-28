<template>
    <div id="manager">
        <i class="fa fa-refresh btn reload fa-fw" @click="apiLogin"></i>
        <banner/>
        <tabs :tabs="{related: 'key', search:'search', settings: 'gear'}" uuid="main-tabs" :current="currentTab">
            <div slot="related">
                <related/>
            </div>
            <div slot="search">
                <search/>
            </div>
            <div slot="settings">
                <settings/>
            </div>
        </tabs>
    </div>
</template>

<script>
    import $ from "jquery";
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
                if (!data.initialized) this.currentTab = 'settings';
            });
        },

        methods: {
            apiLogin: function () {
                if (this.updating) return;
                this.updating = true;

                $('.btn.reload').addClass('fa-spin');
                if(browser.runtime.getBrowserInfo) {
                    browser.runtime.sendMessage(browser.runtime.id, {type: 'reload'}).then(this.resetApiLogin);
                } else {
                    chrome.runtime.sendMessage(chrome.runtime.id, {type: 'reload'}, {}, this.resetApiLogin);
                }
            },
            resetApiLogin() {
                this.updating = false;
                $('.btn.reload').removeClass('fa-spin');
            }
        }
    }
</script>

<style lang="scss">
    @import "~font-awesome/css/font-awesome.min.css";

    body {
        margin      : 0;
        font-size   : 12pt;
        width       : 300px;
        font-family : sans-serif;
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
