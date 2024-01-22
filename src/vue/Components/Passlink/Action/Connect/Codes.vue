<template>
    <div class="passlink-connect-codes">
        <div class="code-info">
            <translate say="PasslinkConnectCheckCodes"/>
        </div>
        <div v-for="code in codes" class="code-container">
            <span class="code">{{code}}</span>
        </div>
    </div>
</template>

<script>
    import Translate from '@vue/Components/Translate';
    import ErrorManager from '@js/Manager/ErrorManager';
    import MessageService from '@js/Services/MessageService';

    export default {
        components: {Translate},

        data() {
            return {codes: []};
        },

        mounted() {
            this.execute().catch(ErrorManager.catch);
        },

        methods: {
            async execute() {
                let reply   = await MessageService.send('passlink.connect.codes'),
                    payload = reply.getPayload();

                if(!payload.success) return this.$emit('error', payload);
                this.codes = payload.codes;

                reply = await MessageService.send('passlink.connect.apply');
                payload = reply.getPayload();

                this.$emit(payload.success ? 'success':'error', payload);
            }
        }
    };
</script>

<style lang="scss">
    .passlink-connect-codes {
        .code-info {
            margin      : 1rem 1rem 2rem;
            font-weight : bold;
            text-align  : center;
        }

        .code-container {
            margin     : .5rem 0;
            text-align : center;

            .code {
                color            : var(--color-primary);
                background-color : var(--color-text);
                border           : 1px solid var(--color-primary);
                border-radius    : var(--border-radius-large);
                font-family      : var(--font-family-mono);
                text-align       : center;
                font-size        : 3rem;
                display          : inline-block;
                line-height      : 3rem;
                padding          : .5rem;
            }
        }
    }
</style>
