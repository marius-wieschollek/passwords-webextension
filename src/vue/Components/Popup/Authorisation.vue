<template>
    <form id="authorisation" @submit.prevent="submit" autocomplete="off" :style="theme" :class="className">
        <h2>{{label}}</h2>
        <div v-if="hasPassword" class="password-container">
            <input-field ref="password"
                         type="password"
                         id="password"
                         :disabled="loggingIn"
                         v-model="password"
                         placeholder="PlaceholderPassword"/>
        </div>
        <div v-if="hasToken" class="token-container">
            <icon class="token-refresh"
                  icon="sync-alt"
                  font="solid"
                  :spin="reloading"
                  @click="requestToken"
                  v-if="tokenRequest"/>
            <select-field v-model="provider"
                          :disabled="loggingIn"
                          :translate="false"
                          :options="authRequest.getProviders()"/>
            <input-field ref="token"
                         type="text"
                         id="token"
                         :disabled="loggingIn"
                         v-model="token"
                         v-if="tokenField"
                         placeholder="PlaceholderToken"/>
        </div>
        <div :class="loginClass">
            <button-field type="submit" value="ButtonLogin"/>
            <icon :icon="icon" :spin="spin" font="solid"/>
        </div>
    </form>
</template>

<script>
    import MessageService from '@js/Services/MessageService';
    import Translate from '@vue/Components/Translate';
    import Icon from '@vue/Components/Icon';
    import Popup from '@js/App/Popup';
    import ToastService from '@js/Services/ToastService';
    import InputField from '@vue/Components/Form/InputField';
    import ButtonField from '@vue/Components/Form/ButtonField';
    import SelectField from '@vue/Components/Form/SelectField';
    import ErrorManager from '@js/Manager/ErrorManager';

    export default {
        components: {SelectField, ButtonField, InputField, Icon, Translate},
        data() {
            return {
                authRequest : null,
                label       : '',
                password    : null,
                token       : null,
                provider    : null,
                hasToken    : false,
                hasPassword : false,
                tokenField  : false,
                tokenRequest: false,
                loggingIn   : false,
                reloading   : false,
                theme       : {}
            };
        },

        async mounted() {
            await this.loadNext();
            if(this.hasPassword) {
                this.$refs.password.$el.focus();
            } else if(this.tokenField) {
                this.$refs.token.$el.focus();
            }
        },

        computed: {
            className() {
                let classNames = this.hasPassword ? 'has-password':'no-password';
                classNames += this.hasToken ? ' has-token':' no-token';

                return classNames;
            },
            loginClass() {
                let classNames = 'login-container';
                classNames += this.loggingIn ? ' logging-in':'';

                return classNames;
            },
            icon() {
                return this.loggingIn ? 'circle-notch':'arrow-right';
            },
            spin() {
                return this.loggingIn;
            }
        },

        methods: {
            async loadNext() {
                this.token = null;
                this.label = '';
                this.password = null;
                this.provider = null;
                this.hasToken = false;
                this.hasPassword = false;
                this.loggingIn = false;
                this.reloading = false;
                this.tokenField = false;
                this.tokenRequest = false;
                this.authRequest = Popup.AuthorisationClient.getCurrent();

                if(this.authRequest !== null) {
                    this.hasToken = this.authRequest.requiresToken();
                    this.hasPassword = this.authRequest.requiresPassword();
                    this.label = this.authRequest.getLabel();
                    this.loadToken();
                    await this.loadTheme();
                } else {
                    this.$parent.authorized = true;
                }
            },
            loadToken() {
                if(this.hasToken) {
                    for(let provider of this.authRequest.getProviders()) {
                        if(!provider.hasRequest) {
                            this.provider = provider.id;
                            return;
                        }
                    }

                    this.provider = this.authRequest.getProviders()[0].id;
                    this.requestToken();
                }
            },
            submit() {
                if(this.hasPassword && !this.password || this.hasToken && !this.token) return;

                this.loggingIn = true;
                this.$forceUpdate();
                setTimeout(() => {this.tryLogin();}, 250);
            },
            async tryLogin() {
                try {
                    await Popup.AuthorisationClient.solveCurrent();
                } catch(e) {
                    ToastService.error('AuthorizationFailedText', 'AuthorizationFailedTitle')
                        .catch(ErrorManager.catch);
                }

                this.loggingIn = false;
                await this.loadNext();
            },
            async requestToken() {
                if(this.reloading || !this.tokenRequest) return;
                this.reloading = true;
                try {
                    let result = await MessageService.send(
                        {
                            type   : 'token.request',
                            payload: {
                                server  : this.authRequest.getServerId(),
                                provider: this.authRequest.getProvider()
                            }
                        }
                    );

                    if(!result.getPayload().success) {
                        ToastService.error(result.getPayload().message, 'TokenRequestFailed')
                            .catch(ErrorManager.catch);
                    }
                } catch(e) {
                    ToastService.error(e.message, 'TokenRequestFailed')
                        .catch(ErrorManager.catch);
                }

                this.reloading = false;
            },
            async loadTheme() {
                let reply = await MessageService.send({type: 'server.theme', payload: this.authRequest.getServerId()});
                this.theme = reply.getPayload();
            }
        },

        watch: {
            provider(value) {
                for(let provider of this.authRequest.getProviders()) {
                    if(provider.id === value) {
                        this.tokenField = provider.hasInput;
                        this.tokenRequest = provider.hasRequest;
                        break;
                    }
                }
                this.token = null;
                this.authRequest.setProvider(value);
                if(this.tokenRequest && value) this.requestToken();
            },
            token(value) {
                this.authRequest.setToken(value);
            },
            password(value) {
                this.authRequest.setPassword(value);
            }
        }
    };
</script>

<style lang="scss">
    #authorisation {
        --color-primary      : #0082c9;
        --color-text         : #ffffff;
        --image-background   : linear-gradient(40deg, #0082c9 0%, #30b6ff 100%);
        --image-logo         : '';
        --border-radius      : var(--button-border-radius);
        --border-radius-pill : var(--button-border-radius-large);

        display              : flex;
        flex-flow            : column;
        align-items          : center;
        justify-content      : center;
        height               : 100vh;
        width                : 100vw;
        overflow             : hidden;
        background-image     : var(--image-background);
        background-position  : center;
        background-size      : cover;

        h2 {
            text-align : center;
            margin     : 0 0 2rem;
            color      : #ffffff;
        }

        .token-container,
        .login-container,
        .password-container {
            text-align : center;

            select,
            button,
            input {
                background-color : var(--element-bg-color);
                color            : var(--element-fg-color);
                width            : 70vw;
                border           : 1px solid var(--element-hover-bg-color);
                border-bottom    : none;
                padding          : .75rem;
                font-size        : 1.5rem;

                &[disabled] {
                    opacity : .9;
                }
            }
        }

        .password-container {
            button {
                border-radius : var(--border-radius) var(--border-radius) 0 0;
            }
        }

        .token-container {
            .token-refresh {
                position  : absolute;
                padding   : .75rem 1rem;
                font-size : 1.5rem;
                color     : var(--color-text);
                cursor    : pointer;
                right     : 0;
            }

            select {
                background-image    : url("/platform/generic/img/angle-down-solid.svg");
                background-repeat   : no-repeat;
                background-position : right 1rem center;
                background-size     : 1rem;
                cursor              : pointer;

                -webkit-appearance  : none;
                -moz-appearance     : none;
            }

            select:last-child,
            input:last-child {
                border-radius : 0 0 var(--border-radius) var(--border-radius);
            }
        }

        &.no-token {
            .password-container {
                input {
                    border-radius : var(--border-radius);
                }
            }
        }

        &.no-password {
            .token-container {
                select {
                    border-radius : var(--border-radius) var(--border-radius) 0 0;

                    &:last-child {
                        border-radius : var(--border-radius);
                    }
                }
            }
        }

        .login-container {
            margin   : 1rem 0;
            position : relative;

            button {
                border           : 1px solid var(--color-text);
                border-radius    : var(--border-radius-pill);
                background-color : var(--color-primary);
                color            : var(--color-text);
                cursor           : pointer;
                text-align       : center;
            }

            .icon {
                position  : absolute;
                display   : block;
                color     : var(--color-text);
                top       : 2px;
                right     : 0;
                padding   : 1rem;
                font-size : 1.5rem;
            }

            &:not(.logging-in) {
                .icon {
                    transition : padding-right .25s ease-in-out;
                }

                &:hover {
                    .icon {
                        padding-right : .5rem;
                    }
                }
            }
        }
    }
</style>