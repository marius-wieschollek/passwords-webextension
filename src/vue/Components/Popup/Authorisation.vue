<template>
    <form id="authorisation" @submit.prevent="submit" autocomplete="off">
        <h2>{{authRequest.getLabel()}}</h2>
        <div v-if="authRequest.requiresPassword()" class="password-container">
            <input type="password" id="password" v-model="password" placeholder="Password">
        </div>
        <div v-if="authRequest.requiresToken()" class="token-container">
            <select v-model="provider">
                <option v-for="element in authRequest.getProviders()"
                        :key="element.id"
                        :value="element.id"
                        :title="element.description">{{element.label}}
                </option>
            </select>
            <input type="button" value="Request Token" @click="requestToken" v-if="tokenRequest">
            <input type="text" id="token" v-model="token" v-if="tokenField" placeholder="Token">
        </div>
        <div class="login-container">
            <input type="submit" value="Login"/>
            <div style="text-align:center;color:#fff">{{state}}</div>
        </div>
    </form>
</template>

<script>
    import Translate from '@vue/Components/Translate';
    import Popup from '@js/App/Popup';
    import MessageService from '@js/Services/MessageService';

    export default {
        components: {Translate},
        data() {
            let current = Popup.AuthorisationClient.getCurrent();

            return {
                authRequest : current,
                password    : null,
                token       : null,
                provider    : null,
                tokenField  : false,
                tokenRequest: false,
                state       : 'loading'
            };
        },

        created() {
            if(this.authRequest.requiresToken() && this.provider === null) {
                for(let provider of this.authRequest.getProviders()) {
                    if(!provider.hasRequest) {
                        this.provider = provider.id;
                        this.state = 'ready';
                        return;
                    }
                }

                this.provider = this.authRequest.getProviders()[0].id;
                this.requestToken();
            }
            this.state = 'ready';
        },

        methods: {
            async submit() {
                if(this.authRequest.requiresPassword() && !this.password || this.authRequest.requiresToken() && !this.token) {
                    this.state = 'input error';
                    return;
                }

                try {
                    this.state = 'login in progess';
                    await Popup.AuthorisationClient.solveCurrent();
                    this.state = 'login success';
                } catch(e) {
                    this.state = 'login failed';
                }
            },
            async requestToken() {
                this.state = 'token request';
                let result = await MessageService.send(
                    {
                        type   : 'token.request',
                        payload: {
                            server  : this.authRequest.getServerId(),
                            provider: this.authRequest.getProvider()
                        }
                    }
                );

                this.state = result.getPayload().success ? 'ready':'token request failed';
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
                if(this.tokenRequest) this.requestToken();
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
        display          : flex;
        flex-flow        : column;
        align-items      : center;
        justify-content  : center;
        height           : 100vh;
        width            : 100vw;
        overflow         : hidden;
        background-image : linear-gradient(40deg, #0082c9 0%, #30b6ff 100%);

        h2 {
            text-align : center;
            margin     : 0 0 2rem;
            color      : #fff;
        }

        .token-container,
        .login-container,
        .password-container {
            text-align : center;

            select,
            input {
                width : 80vw;
            }
        }

        .login-container {
            margin : 1rem 0;
        }
    }
</style>