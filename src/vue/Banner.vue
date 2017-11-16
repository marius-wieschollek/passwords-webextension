<template>
    <div class="banner" @click="openPage"></div>
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
        background : #0082c9 url('../img/nextcloud.svg') no-repeat center;
        height     : 125px;
        width      : 250px;
        display    : block;
        cursor     : pointer;
    }
</style>