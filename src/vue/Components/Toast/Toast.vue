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
                if(this.toast.getModal()) {
                    className += `${className} modal`;
                }

                return className;
            },
            hasCloseButton() {
                return this.toast.getCloseable() && this.toast.getDefault() !== 'close';
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
        background-color : var(--info-bg-color);
        color            : var(--info-fg-color);
    }

    .icon {
        float         : right;
        position      : relative;
        margin        : -.25rem;
        padding       : .2rem;
        text-align    : center;
        cursor        : pointer;
        transition    : background-color .15s;
        border-radius : 3px;

        &:hover {
            background-color : var(--success-hv-color);
        }
    }

    .button {
        padding    : .5rem;
        margin     : 0 -.5rem;
        text-align : center;
        border-top : 1px solid var(--info-hv-color);
        cursor     : pointer;

        &:hover {
            border-top-color : transparent;
            background-color : var(--info-hv-color);
        }

        &:first-of-type {
            margin-top : .5rem;
        }

        &:last-of-type {
            margin-bottom : -.5rem;
            border-radius : 0 0 .25rem .25rem;
        }
    }

    &.success .toast-content {
        background-color : var(--success-bg-color);
        color            : var(--success-fg-color);

        .icon:hover {
            background-color : var(--success-hv-color);
        }

        .button {
            border-top-color : var(--warning-hv-color);

            &:hover {
                border-top-color : transparent;
                background-color : var(--warning-hv-color);
            }
        }
    }

    &.warning .toast-content {
        background-color : var(--warning-bg-color);
        color            : var(--warning-fg-color);

        .icon:hover {
            background-color : var(--warning-hv-color);
        }

        .button {
            border-top-color : var(--warning-hv-color);

            &:hover {
                border-top-color : transparent;
                background-color : var(--warning-hv-color);
            }
        }
    }

    &.error .toast-content {
        background-color : var(--error-bg-color);
        color            : var(--error-fg-color);

        .icon:hover {
            background-color : var(--error-hv-color);
        }

        .button {
            border-top-color : var(--error-hv-color);

            &:hover {
                border-top-color : transparent;
                background-color : var(--error-hv-color);
            }
        }
    }

    &.has-default {
        cursor : pointer;
    }

    &.modal {
        position         : fixed;
        left             : 0;
        right            : 0;
        top              : 0;
        background-color : var(--modal-bg-color);
        bottom           : 0;
        backdrop-filter  : blur(2px);
        display          : flex;
        align-items      : center;
        justify-content  : center;
    }

    .title {
        font-weight   : bold;
        margin-bottom : .25rem;
        display       : block;
    }

    .message {
        display : block;
    }
}
</style>