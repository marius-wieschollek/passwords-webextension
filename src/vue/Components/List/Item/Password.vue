<template>
    <li class="item password-item">
        <div class="item-main" :class="{'has-menu':(showMenu || showEntry ? true : false)}">
            <div class="label" @click="sendPassword()" :title="title">
                <favicon :password="password.getId()" :size="22" v-if="favicon"/>
                {{ label }}
            </div>
            <div class="options">
                <icon icon="user" hover-icon="clipboard" @click="copy('username')" draggable="true" @dragstart="drag($event, 'username')"/>
                <icon icon="key" font="solid" hover-icon="clipboard" hover-font="regular" @click="copy('password')" draggable="true" @dragstart="drag($event, 'password')"/>
                <icon icon="ellipsis-h" font="solid" @click="toggleMenu()"/>
            </div>
            <icon :class="securityClass" icon="shield-alt" font="solid"/>
        </div>
        <password-menu :show="showMenu" :password="password" v-on:copy="copy($event)" v-on:delete="$emit('delete', password)" v-on:toggleEntry="toggleEntry()"/>
        <password-view v-if="showEntry" :password="password" v-on:toggleEntry="toggleEntry()"/>
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
    import PasswordSettingsManager from '@js/Manager/PasswordSettingsManager';
    import Translate from "@vue/Components/Translate";
    import PasswordMenu from "@vue/Components/List/Item/Menu/PasswordMenu";
    import PasswordView        from '@vue/Components/Password/View';

    export default {
        components: {PasswordMenu, Translate, Favicon, Icon, PasswordView},
        props     : {
            password: {
                type: Password
            },
            favicon : {
                type   : Boolean,
                default: false
            },
            menu    : {
                type   : Boolean,
                default: true
            }
        },

        data() {
            return {
                active   : true,
                showMenu : false,
                showEntry: false
            };
        },

        computed: {
            securityClass() {
                let types = ['secure', 'warn', 'bad'];

                return `security ${types[this.password.getStatus()]}`;
            },
            title() {
                return LocalisationService.translate('PasswordItemTitle', this.password.getId(), this.password.getStatusCode());
            },
            label() {
                if(PasswordSettingsManager.getShowUserInList() && this.password.getUserName() !== '') {
                    return this.password.getLabel() + " - " + this.password.getUserName();
                }
                return this.password.getLabel();
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
                        ToastService
                            .error(['PasswordPastedError', this.password.getLabel()], null, 3)
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

                    if(this.password.getStatus() === 2 && await SettingsService.getValue('paste.compromised.warning')) {
                        ToastService
                            .warning('PasteBadPasswordWarning', null, 3)
                            .catch(ErrorManager.catchEvt);
                    }

                    if(await SettingsService.getValue('paste.popup.close') && this.active) {
                        window.close();
                    }
                } catch(e) {
                    ErrorManager.logError(e);
                }
            },
            copy(property) {
                let data = this.password.getProperty(property),
                    type = property === 'password' ? 'password':'text';
                MessageService.send({type: 'clipboard.write', payload: {type, value: data}}).catch(ErrorManager.catch);

                let label = property.capitalize();
                if(['password', 'username', 'url'].indexOf(property) !== -1) {
                    label = LocalisationService.translate(`Property${label}`);
                }

                ToastService.success(['PasswordPropertyCopied', label])
                            .catch(ErrorManager.catch);
            },
            drag(event, property) {
                let data = this.password.getProperty(property);
                event.dataTransfer.setData('text/plain', data);
            },
            toggleMenu() {
                if(this.showEntry === true) {
                    this.showEntry = false;
                } else {
                    this.showMenu = !this.showMenu;
                }
            },
            toggleEntry() {
                this.showMenu = false;
                this.showEntry = !this.showEntry;
            }
        }
    };
</script>

<style lang="scss">
.item.password-item {
    .item-main {
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
            padding       : 0 .25rem 0 .5rem;
            min-width     : calc(100vw - 3rem);
            max-width     : calc(100vw - 3rem);
            white-space   : nowrap;
            overflow      : hidden;
            text-overflow : ellipsis;
            transition    : min-width .25s ease-in-out;

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
            margin-left      : 3rem;
            transition       : opacity 0s linear .25s, margin-left .125s linear, var(--element-transition);

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

        &:hover,
        &.has-menu {
            background-color : var(--element-hover-bg-color);
            color            : var(--element-hover-fg-color);

            > .label {
                flex-shrink : 1;
                min-width   : 50vw;
            }

            .options {
                background-color : var(--element-hover-bg-color);
                opacity          : 1;
                margin-left      : 0;
                transition       : margin-left .125s linear;

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