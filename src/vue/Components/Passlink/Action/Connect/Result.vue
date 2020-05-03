<template>
    <div class="passlink-connect-result">
        <icon :icon="icon" :class="cssClass"/>
        <translate tag="div" class="message" :say="text"/>
        <translate tag="div" class="message secondary" :say="getMessage" :variables="[message]"/>
        <div class="options">
            <translate tag="button" say="PasslinkConnectSettings" @click="settings()"/>
            <translate tag="button" say="PasslinkConnectClose" @click="close()"/>
        </div>
    </div>
</template>

<script>
    import Translate from '@vue/Components/Translate';
    import Icon from '@vue/Components/Icon';
    import SystemService from '@js/Services/SystemService';
    import MessageService from '@js/Services/MessageService';
    import ErrorManager from '@js/Manager/ErrorManager';

    export default {
        components: {Icon, Translate},
        props     : {
            success: Boolean,
            message: String
        },

        computed: {
            cssClass() {
                return this.success ? '':' error';
            },
            text() {
                return this.success ? 'PasslinkConnectSuccess':'PasslinkConnectFailed';
            },
            getMessage() {
                return this.success ? 'PasslinkConnectServer':this.message;
            },
            icon() {
                return this.success ? 'check-circle':'times-circle';
            }
        },

        mounted() {
            setTimeout(() => {this.close();}, 10000);
        },

        methods: {
            async settings() {
                await SystemService.getBrowserApi().runtime.openOptionsPage();
                this.close();
            },
            close() {
                MessageService.send('tab.close').catch(ErrorManager.catch);
            }
        }
    };
</script>

<style lang="scss">
    .passlink-connect-result {
        .icon {
            display     : block;
            font-size   : 8rem;
            line-height : 8rem;
            text-align  : center;
            margin      : 3rem 3rem 2rem;
            color       : var(--success-bg-color);

            &.error {
                color : var(--error-bg-color);
            }
        }

        .message {
            text-align  : center;
            margin      : 0 1rem 1rem;
            font-weight : bold;

            &.secondary {
                font-weight : normal;
            }
        }

        .options {
            position : absolute;
            bottom   : 0;
            width    : 100vw;
            padding  : .5rem 0;

            button {
                background-color : var(--color-text);
                color            : var(--color-primary);
                border           : 1px solid var(--color-text);
                border-radius    : var(--border-radius-pill);
                transition       : var(--button-transition);
                cursor           : pointer;

                padding          : .6rem;
                display          : block;
                margin           : .5rem 1rem;
                text-align       : center;
                width            : calc(100% - 2rem);

                &:hover {
                    background-color : var(--color-primary);
                    color            : var(--color-text);
                    border           : 1px solid var(--color-text);
                }
            }
        }
    }
</style>