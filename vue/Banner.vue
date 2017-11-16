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

        components: {},

        methods: {
            openPage() {
                browser.tabs.create({url: this.url});
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
    }
</style>