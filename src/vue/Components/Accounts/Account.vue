<template>
    <form class="account-form" v-on:submit.prevent="save()">
        <translate tag="div" class="server-error" say="ServerIncompatibleError" v-if="server.hasFlag(server.FLAG_INCOMPATIBLE)">
            <icon icon="exclamation-triangle" font="solid" slot="before"/>
        </translate>
        <translate tag="div" class="server-warning" say="ServerSoonIncompatibleWarning" v-if="server.hasFlag(server.FLAG_SOON_INCOMPATIBLE)">
            <icon icon="exclamation-triangle" font="solid" slot="before"/>
        </translate>
        <translate tag="div" class="server-info" say="ServerDisabledWarning" v-if="!server.getEnabled()">
            <icon icon="exclamation-circle" font="solid" slot="before"/>
        </translate>

        <fieldset :disabled="submitting">
            <translate tag="label" :for="`${id}-label`" say="ServerLabel" required/>
            <input type="text" :id="`${id}-label`" v-model="label"/>
            <translate tag="label" :for="`${id}-url`" say="ServerBaseUrl" required/>
            <input type="url" pattern="https://.+" :id="`${id}-url`" v-model="url"/>
            <translate tag="label" :for="`${id}-user`" say="ServerUser" required/>
            <input type="text" :id="`${id}-user`" v-model="user"/>
            <translate tag="label" :for="`${id}-token`" say="ServerToken" required/>
            <input type="button" :value="changeLabel" :id="`${id}-token`" v-if="!changeToken" @click="editToken()"/>
            <input type="text" :id="`${id}-token`" v-model="token"
                   required
                   pattern="([A-Za-z0-9]{5}-?){5}"
                   placeholder="xxxxx-xxxxx-xxxxx-xxxxx-xxxxx" v-else/>
            <translate tag="label" :for="`${id}-timeout`" say="ServerTimeout" required v-if="lockable"/>
            <select-field :options="timeoutOptions" :id="`${id}-timeout`" v-model="timeout" v-if="lockable"/>
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
    import SelectField from "@vue/Components/Form/SelectField";

    export default {
        components: {SelectField, Icon, Translate},

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
                lockable   : this.server.getLockable(),
                timeout    : this.server.getTimeout(),
                changeLabel: LocalisationService.translate('ServerTokenChange'),
                token      : '',
                submitting : false,
                changeToken: false
            };
        },

        computed: {
            timeoutOptions() {
                let options = [{id: 0, label: 'ServerTimeoutOptionNever'}];

                for(let i of [2, 5, 10, 15, 30, 60]) {
                    options.push({id: i * 60 * 1000, label: ['ServerTimeoutOptionMinutes', i]});
                }

                return options;
            }
        },

        methods: {
            async save() {
                if(!this.$el.reportValidity() || this.submitting) return;

                let message;
                try {
                    this.submitting = true;
                    this.server
                        .setLabel(this.label)
                        .setBaseUrl(this.url)
                        .setTimeout(this.timeout)
                        .setUser(this.user);

                    if(this.changeToken) {
                        this.server.setToken(this.token);
                    }

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
    .server-info,
    .server-warning,
    .server-error {
        background-color : var(--info-bg-color);
        color            : var(--info-fg-color);
        margin           : .5rem;
        border-radius    : 3px;
        padding          : 1rem;

        &.server-warning {
            background-color : var(--warning-bg-color);
            color            : var(--warning-fg-color);
        }

        &.server-error {
            background-color : var(--error-bg-color);
            color            : var(--error-fg-color);
        }

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

        input:invalid {
            box-shadow : 0 0 .5rem .25rem var(--error-bg-color);
        }
    }
}
</style>