<template>
    <div class="passlink-connect" :style="style">
        <connect-codes v-on:error="error" v-on:success="success" v-if="step === 0"/>
        <connect-result :success="result" :message="message" :updated="updated" v-else/>
    </div>
</template>

<script>
    import ConnectResult from '@vue/Components/Passlink/Action/Connect/Result';
    import ConnectCodes from '@vue/Components/Passlink/Action/Connect/Codes';
    import MessageService from '@js/Services/MessageService';

    export default {
        components: {ConnectCodes, ConnectResult},
        data() {
            return {
                step   : 0,
                style  : {},
                result : true,
                updated : false,
                message: ''
            };
        },

        mounted() {
            MessageService.send('passlink.connect.theme').then((reply) => {
                if(reply.getPayload().success) {
                    this.style = reply.getPayload().vars;
                }
            });
        },

        methods: {
            error(message) {
                this.step = 1;
                this.result = false;
                this.message = message.message;
            },
            success(message) {
                this.step = 1;
                this.result = true;
                this.message = message.message;
                this.updated = message.updated;
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