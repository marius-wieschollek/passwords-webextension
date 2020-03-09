<template>
    <li class="item password-item">
        <div class="label" @click="sendPassword()" :title="password.getId()">
            <favicon :password="password.getId()" :size="22" v-if="favicon"/>
            {{password.getLabel()}}
        </div>
        <div class="options">
            <icon icon="user" hover-icon="clipboard" @click="copy('username')"/>
            <icon icon="key" font="solid" hover-icon="clipboard" hover-font="regular" @click="copy('password')"/>
        </div>
    </li>
</template>

<script>
    import Password from 'passwords-client/src/Model/Password/Password';
    import Icon from '@vue/Components/Icon';
    import MessageService from '@js/Services/MessageService';
    import Favicon from '@vue/Components/List/Item/Favicon';
    import ToastService from '@js/Services/ToastService';
    import ErrorManager from '@js/Manager/ErrorManager';
    import LocalisationService from '@js/Services/LocalisationService';

    export default {
        components: {Favicon, Icon},
        props     : {
            password: {
                type: Password
            },
            favicon : {
                type   : Boolean,
                default: false
            }
        },

        methods: {
            async sendPassword() {
                try {
                    await MessageService.send({type: 'password.fill', payload: this.password.getId()});

                    ToastService.success(['PasswordPastedSuccess', this.password.getLabel()])
                        .catch(ErrorManager.catch)
                        .then(window.close);
                } catch(e) {
                    ErrorManager.logError(e);
                    ToastService.success(['PasswordPastedError', this.password.getLabel()])
                        .catch(ErrorManager.catch);
                }
            },
            copy(property) {
                let data = this.password.getProperty(property);
                navigator.clipboard.writeText(data);

                let label = property.capitalize();
                if(['password', 'username', 'url'].indexOf(property) === -1) {
                    label = LocalisationService.translate(`Property${property}`);
                }

                ToastService.success(['PasswordPropertyCopied', label])
                    .catch(ErrorManager.catch);
            }
        }
    };
</script>

<style lang="scss">
    .item.password-item {
        line-height      : 3rem;
        font-size        : 1rem;
        background-color : var(--element-bg-color);
        color            : var(--element-fg-color);
        cursor           : pointer;
        display          : flex;
        overflow         : hidden;
        transition       : var(--element-transition);

        > * {
            flex-grow   : 0;
            flex-shrink : 0;
        }

        > .label {
            flex-grow     : 1;
            padding       : 0 .5rem;
            min-width     : 100vw;
            white-space   : nowrap;
            transition    : min-width .25s ease-in-out;
            overflow      : hidden;
            text-overflow : ellipsis;

            .favicon {
                vertical-align : middle;
                border-radius  : 3px;
                padding        : .5rem;
                width          : 1.5rem;
                height         : 1.5rem;
                box-sizing     : content-box;
                margin-left    : -.5rem;

                &.error {
                    padding    : .75rem;
                    max-width  : 1rem;
                    max-height : 1rem;
                }
            }
        }

        .options {
            opacity    : 0;
            transition : opacity 0s linear .25s;
            display    : flex;

            .icon {
                text-align : center;
                width      : 3rem;
                display    : inline-block;
            }
        }

        &:hover {
            background-color : var(--element-hover-bg-color);
            color            : var(--element-hover-fg-color);

            > .label {
                flex-shrink : 1;
                min-width   : 50vw;
            }

            .options {
                > .icon,
                > .option {
                    background-color : var(--button-bg-color);
                    color            : var(--button-fg-color);
                    transition       : var(--button-transition);

                    &:hover {
                        background-color : var(--button-hover-bg-color);
                        color            : var(--button-hover-fg-color);
                    }
                }

                opacity    : 1;
                transition : none;
            }
        }
    }

    body.mobile {
        .item.password-item {
            > .label {
                flex-shrink : 1;
                min-width   : 50vw;
            }

            .options {
                opacity    : 1;
                transition : none;
                color      : var(--button-hover-bg-color);
            }
        }
    }
</style>