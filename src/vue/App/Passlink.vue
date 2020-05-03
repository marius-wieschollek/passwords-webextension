<template>
    <div id="passlink">
        <connect v-if="action === 'connect'"/>
        <error :action-data="actionData" v-if="action === 'error'" />
        <div id="toasts"></div>
    </div>
</template>

<script>
    import Connect from '@vue/Components/Passlink/Action/Connect';
    import Error from '@vue/Components/Passlink/Action/Error';

    export default {
        components: {Error, Connect},
        el        : '#app',

        props: {
            action    : {
                type: String
            },
            actionData: {
                type   : Object,
                default: () => {
                    return {};
                }
            }
        }
    };
</script>

<style lang="scss">
    @import "@scss/includes";
    @import "@scssP/browser.scss";

    body {
        overflow : hidden;

        &.mobile {
            width  : 100vw;
            height : 100vh;
        }

        &.desktop {
            width  : 360px;
            height : 360px;
        }
    }

    #passlink {
        width    : 100vw;
        height   : 100vh;
        display  : block;
        overflow : hidden;
    }
</style>