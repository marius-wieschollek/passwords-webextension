<template>
    <div :class="className" @click.prevent="open()">
        <div class="toast-content">
            <icon icon="times" font="solid" title="ButtonClose" @click.prevent="close()" v-if="hasCloseButton"/>
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
    </div>
</template>

<script>
    import Translate from '@vue/Components/Translate';
    import Toast from '@js/Models/Toast/Toast';
    import Icon from '@vue/Components/Icon';

    export default {
        components: {Icon, Translate},
        props     : {
            toast: Toast
        },

        computed: {
            className() {
                let className = `toast ${this.toast.getType()}`;

                if(this.toast.getCloseable()) {
                    className += `${className} has-default`;
                }

                return className;
            },
            hasCloseButton() {
                return this.toast.getCloseable() && this.toast.getDefault() !== 'close'
            }
        },

        methods: {
            open() {
                if(this.toast.getDefault()) {
                    this.$emit('choose', this.toast.getDefault());
                }
            },
            close() {
                if(this.toast.getCloseable()) {
                    this.$emit('choose', null);
                }
            },
            choose(name) {
                this.$emit('choose', name);
            }
        }
    };
</script>

<style lang="scss">
    .toast {
        overflow : hidden;

        .toast-content {
            margin           : 0 .5rem .5rem;
            border-radius    : .25rem;
            padding          : .5rem;
            color            : #fff;
            background-color : #0652dd;
        }

        .icon {
            float      : right;
            position   : relative;
            margin     : -.25rem;
            padding    : .25rem;
            text-align : center;

            &:before {
                position : relative;
                z-index  : 1;
            }

            &:after {
                content          : '';
                background-color : var(--element-secondary-text-color);
                opacity          : 0;
                position         : absolute;
                top              : 0;
                left             : 0;
                right            : 0;
                bottom           : 0;
                border-radius    : 3px;
                transition       : opacity .15s;
                cursor           : pointer;
            }

            &:hover:after {
                opacity : .25;
            }
        }

        &.warning .toast-content {
            background-color : #ffc312;
        }

        &.error .toast-content {
            background-color : #ff3f34;
        }

        &.success .toast-content {
            background-color : #05c46b;
        }

        &.has-default {
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