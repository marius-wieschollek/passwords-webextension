<template>
    <div class="banner theme" @click="openPage"></div>
</template>

<script>
    export default {
        props: {
            url: {
                type: String
            }
        },

        methods: {
            openPage() {
                browser.storage.sync.get(['url']).then((data) => {
                    browser.tabs.create({url: data.url + '/index.php/apps/passwords/'});
                });
            }
        }
    }
</script>

<style lang="scss">
    .banner {
        background : url('../../img/nextcloud.svg') no-repeat center;
        height     : 125px;
        width      : 100%;
        display    : block;
        cursor     : pointer;
    }
</style>