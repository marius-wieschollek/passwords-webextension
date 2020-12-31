<template>
    <div class="passlink-error">
        <icon icon="times-circle"/>
        <translate tag="div" class="message" :say="message"/>
        <div class="options">
            <translate tag="button" say="PasslinkErrorClose" @click="close()"/>
        </div>
    </div>
</template>

<script>
    import Icon from '@vue/Components/Icon';
    import Translate from '@vue/Components/Translate';
    import ErrorManager from '@js/Manager/ErrorManager';
    import MessageService from '@js/Services/MessageService';

    export default {
        components: {Icon, Translate},
        props     : {
            actionData: Object
        },

        computed: {
            message() {
                return this.actionData.message ? this.actionData.message:'PasslinkErrorNoMessage';
            }
        },

        methods: {
            close() {
                MessageService.send('tab.close').catch(ErrorManager.catch);
            }
        }
    };
</script>

<style lang="scss">
    .passlink-error {
        .icon {
            display     : block;
            font-size   : 8rem;
            line-height : 8rem;
            text-align  : center;
            margin      : 3rem 3rem 2rem;
            color       : var(--error-bg-color);
        }

        .message {
            text-align  : center;
            margin      : 0 1rem 1rem;
            font-weight : bold;
        }

        .options {
            position : absolute;
            bottom   : 0;
            width    : 100vw;
            padding  : .5rem 0;

            button {
                background-color : var(--element-active-bg-color);
                color            : var(--element-active-fg-color);
                border           : 1px solid var(--element-active-fg-color);
                transition       : var(--button-transition);
                cursor           : pointer;

                padding          : .6rem;
                display          : block;
                margin           : .5rem 1rem;
                text-align       : center;
                width            : calc(100% - 2rem);

                &:hover {
                    background-color : var(--element-active-hover-bg-color);
                    color            : var(--element-active-hover-fg-color);
                    border           : 1px solid var(--element-active-hover-fg-color);
                }
            }
        }
    }
</style>