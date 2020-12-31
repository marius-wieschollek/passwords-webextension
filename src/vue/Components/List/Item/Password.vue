<template>
    <li class="item password-item">
        <div class="label" @click="sendPassword()" :title="title">
            <favicon :password="password.getId()" :size="22" v-if="favicon"/>
            {{ password.getLabel() }}
        </div>
        <div class="options">
            <icon icon="user" hover-icon="clipboard" @click="copy('username')" draggable="true" @dragstart="drag($event, 'username')"/>
            <icon icon="key" font="solid" hover-icon="clipboard" hover-font="regular" @click="copy('password')" draggable="true" @dragstart="drag($event, 'password')"/>
        </div>
        <icon :class="securityClass" icon="shield-alt" font="solid"/>
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
    import SettingsService from '@js/Services/SettingsService';

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

        data() {
            return {
                active: true
            };
        },

        computed: {
            securityClass() {
                let types = ['secure', 'warn', 'bad'];

                return `security ${types[this.password.getStatus()]}`;
            },
            title() {
                return LocalisationService.translate('PasswordItemTitle', this.password.getId(), this.password.getStatusCode());
            }
        },

        activated() {
            this.active = true;
        },

        deactivated() {
            this.active = false;
        },

        methods: {
            async sendPassword() {
                try {
                    let response = await MessageService.send({type: 'password.fill', payload: this.password.getId()});

                    if(response.getPayload().success === false) {
                        ToastService.error(['PasswordPastedError', this.password.getLabel()], null, 3)
                                    .catch(ErrorManager.catchEvt);
                        return;
                    }
                } catch(e) {
                    ErrorManager.logError(e);
                    ToastService.error(['PasswordPastedError', this.password.getLabel()], null, 3)
                                .catch(ErrorManager.catchEvt);
                    return;
                }

                try {
                    await ToastService.success(['PasswordPastedSuccess', this.password.getLabel()]);
                    if(await SettingsService.getValue('paste.popup.close') && this.active) {
                        window.close();
                    }
                } catch(e) {
                    ErrorManager.logError(e);
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
            },
            drag(event, property) {
                let data = this.password.getProperty(property);
                event.dataTransfer.setData('text/plain', data);
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
    position         : relative;

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
        opacity          : 0;
        display          : flex;
        z-index          : 1;
        background-color : var(--element-bg-color);
        transition       : opacity 0s linear .25s, var(--element-transition);

        .icon {
            text-align : center;
            width      : 3rem;
            display    : inline-block;
        }
    }

    .security {
        position    : absolute;
        right       : 0;
        text-align  : center;
        width       : 3rem;
        display     : inline-block;
        line-height : 3rem;
        z-index     : 0;

        &.secure {
            color : var(--success-bg-color)
        }

        &.warn {
            color : var(--warning-bg-color)
        }

        &.bad {
            color : var(--error-bg-color)
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
            background-color : var(--element-hover-bg-color);
            opacity          : 1;
            transition       : none;

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