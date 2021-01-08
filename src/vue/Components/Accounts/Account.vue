<template>
    <form class="account-form" v-on:submit.prevent="save()">
        <translate tag="div" class="server-warning" say="ServerDisabledWarning" v-if="!server.getEnabled()">
            <icon icon="exclamation-triangle" font="solid" slot="before"/>
        </translate>

        <fieldset :disabled="submitting">
            <translate tag="label" :for="`${id}-label`" say="ServerLabel" required/>
            <input type="text" :id="`${id}-label`" v-model="label"/>
            <translate tag="label" :for="`${id}-url`" say="ServerBaseUrl" required/>
            <input type="text" :id="`${id}-url`" v-model="url"/>
            <translate tag="label" :for="`${id}-user`" say="ServerUser" required/>
            <input type="text" :id="`${id}-user`" v-model="user"/>
            <translate tag="label" :for="`${id}-token`" say="ServerToken" required/>
            <input type="button" :value="changeLabel" :id="`${id}-token`" v-if="!changeToken" @click="editToken()"/>
            <input type="text" :id="`${id}-token`" v-model="token"
                   required
                   pattern="([A-Za-z0-9]{5}-?){5}"
                   placeholder="xxxxx-xxxxx-xxxxx-xxxxx-xxxxx" v-else/>
            <input type="text" :id="`${id}-timeout`" v-model="user"/>
            <translate tag="label" :for="`${id}-timeout`" say="ServerTimeout" required/>
        </fieldset>
    </form>
</template>

<script>
    import Server from '@js/Models/Server/Server';
    import Translate from '@vue/Components/Translate';
    import MessageService from '@js/Services/MessageService';
    import ToastService from '@js/Services/ToastService';
    import ErrorManager from '@js/Manager/ErrorManager';
    import Icon from '@vue/Components/Icon';
    import LocalisationService from "@js/Services/LocalisationService";

    export default {
        components: {Icon, Translate},

        props: {
            server: {
                type: Server
            }
        },

        data() {
            return {
                id         : this.server.getId(),
                label      : this.server.getLabel(),
                url        : this.server.getBaseUrl(),
                user       : this.server.getUser(),
                timeout    : this.server.getTimeout(),
                changeLabel: LocalisationService.translate('ServerTokenChange'),
                token      : '',
                submitting : false,
                changeToken: false
            };
        },

        methods: {
            async save() {
                if(!this.$el.reportValidity() || this.submitting) return;

                this.submitting = true;
                this.server
                    .setLabel(this.label)
                    .setBaseUrl(this.url)
                    .setTimeout(this.timeout)
                    .setUser(this.user);

                if(this.changeToken) {
                    this.server.setToken(this.token);
                }

                let message;
                try {
                    message = await MessageService.send(
                        {
                            type   : 'server.update',
                            payload: this.server
                        }
                    );
                } catch(e) {
                    ErrorManager.logError(e);
                    ToastService.error(e.message, 'ServerSaveErrorTitle')
                                .catch(ErrorManager.catch);
                    this.submitting = false;
                    return;
                }

                if(message.getType() === 'server.item') {
                    this.token = '';
                    this.changeToken = false;
                    ToastService.success('ServerSaveMessage', 'ServerSaveTitle')
                                .catch(ErrorManager.catch);
                    this.$emit('change');
                } else {
                    let payload = message.getPayload(),
                        text    = payload.message;
                    if(payload.errors) {
                        for(let key in payload.errors) {
                            if(payload.errors.hasOwnProperty(key)) text += ' ' + payload.errors[key];
                        }
                    }

                    ToastService
                        .error(text, 'ServerSaveErrorTitle')
                        .catch(ErrorManager.catch);
                }

                this.submitting = false;
            },

            editToken() {
                this.changeToken = true;
            }
        },

        watch: {
            label(value) {
                this.server.setLabel(value);
            }
        }
    };
</script>

<style lang="scss">
.account-form {
    .server-warning {
        background-color : var(--warning-bg-color);
        color            : var(--warning-fg-color);
        margin           : .5rem;
        border-radius    : 3px;
        padding          : 1rem;

        .icon {
            margin-right : .5rem;
        }
    }

    fieldset {
        margin : 0;
        border : 0;

        &[disabled="disabled"] {
            input {
                opacity : 0.5;
                cursor  : default;
            }
        }
    }
}
</style>