<template>
    <div class="passlink-connect" :style="style">
        <connect-codes :action-data="actionData"
                       v-on:error="error"
                       v-on:success="success"
                       v-on:theme="theme"
                       v-if="step === 0"/>
        <connect-result :success="result" :message="message" v-else/>
    </div>
</template>

<script>
    import ConnectResult from '@vue/Components/Passlink/Action/Connect/Result';
    import ConnectCodes from '@vue/Components/Passlink/Action/Connect/Codes';
    import ThemeCssVarsHelper from '@js/Helper/ThemeCssVarsHelper';

    export default {
        components: {ConnectCodes, ConnectResult},
        props     : {
            actionData: Object
        },

        data() {
            return {
                step   : 0,
                style  : {},
                result : true,
                message: ''
            };
        },

        methods: {
            theme(theme) {
                this.style = ThemeCssVarsHelper.processTheme(theme);
            },
            error(message) {
                this.step = 1;
                this.result = false;
                this.message = message;
            },
            success(message) {
                this.step = 1;
                this.result = true;
                this.message = message;
            }
        }
    };
</script>

<style lang="scss">
    .passlink-connect {
        width               : 100vw;
        height              : 100vh;
        position            : absolute;
        background-image    : var(--image-background);
        background-position : center;
        background-size     : cover;
        color               : var(--color-text);
    }
</style>