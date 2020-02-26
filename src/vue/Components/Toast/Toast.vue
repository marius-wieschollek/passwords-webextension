<template>
    <div :class="className" @click.prevent="close()">
        <translate class="title" :say="toast.getTitle()" :variables="toast.getTitleVars()" v-if="toast.getTitle()"/>
        <translate class="message" :say="toast.getMessage()" :variables="toast.getMessageVars()"/>
        <translate tag="div"
                   class="button"
                   :say="button"
                   :key="name"
                   v-for="(button, name) in toast.getOptions()"
                   v-if="toast.getOptions()"
                   @click.prevent="choose(name)"/>
    </div>
</template>

<script>
    import Translate from '@vue/Components/Translate';
    import Toast from '@js/Models/Toast/Toast';

    export default {
        components: {Translate},
        props     : {
            toast: Toast
        },

        computed: {
            className() {
                let className = `toast ${this.toast.getType()}`;

                if(this.toast.getCloseable()) {
                    return `${className} closeable`;
                }

                return className;
            }
        },

        methods: {
            close() {
                if(this.toast.getCloseable()) {
                    this.$emit('close', 'close');
                }
            },
            choose(name) {
                this.$emit('close', name);
            }
        }
    };
</script>

<style lang="scss">
    .toast {
        margin           : .5rem;
        border-radius    : .25rem;
        padding          : .5rem;
        color            : #fff;
        background-color : #0652dd;

        &.waring {
            background-color : #ffc312;
        }

        &.error {
            background-color : #ea2027;
        }

        &.success {
            background-color : #009432;
        }

        &.closeable {
            cursor : pointer;
        }

        .title {
            font-weight   : bold;
            margin-bottom : .25rem;
            display       : block;
        }

        .message {
            display : block;
        }

        .button {
            padding    : .5rem;
            margin     : 0 -.5rem;
            text-align : center;
            border-top : 1px solid rgba(0, 0, 0, .25);
            cursor     : pointer;

            &:hover {
                background-color : rgba(0, 0, 0, .25);
                border-top       : 1px solid rgba(0, 0, 0, 0);
            }

            &:first-of-type {
                margin-top : .5rem;
            }

            &:last-of-type {
                margin-bottom : -.5rem;
                border-radius : 0 0 .25rem .25rem;
            }
        }
    }
</style>