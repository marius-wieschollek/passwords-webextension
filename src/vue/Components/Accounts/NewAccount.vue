<template>
    <form class="account-form" v-on:submit.prevent="save()">
        <fieldset :disabled="submitting">
            <translate tag="label" for="new-name" say="ServerLabel"/>
            <input type="text" id="new-name" v-model="label" required/>
            <translate tag="label" for="new-url" say="ServerBaseUrl"/>
            <input type="url" pattern="https://.+" id="new-url" v-model="baseUrl" required/>
            <translate tag="label" for="new-user" say="ServerUser"/>
            <input type="text" id="new-user" v-model="user" required/>
            <translate tag="label" for="new-token" say="ServerToken"/>
            <input type="text"
                   value="Change"
                   id="new-token"
                   v-model="token"
                   required
                   pattern="([A-Za-z0-9]{5}-?){5}"
                   placeholder="xxxxx-xxxxx-xxxxx-xxxxx-xxxxx"/>
        </fieldset>
    </form>
</template>

<script>
    import MessageService from '@js/Services/MessageService';
    import Translate from '@vue/Components/Translate';
    import ToastService from '@js/Services/ToastService';
    import ErrorManager from '@js/Manager/ErrorManager';

    export default {
        components: {Translate},
        data() {
            return {
                submitting: false,
                label     : '',
                baseUrl   : '',
                user      : '',
                token     : ''
            };
        },

        methods: {
            /**
             *
             */
            async save() {
                if(!this.$el.reportValidity() || this.submitting) return;

                this.submitting = true;
                let payload = {
                    label  : this.label,
                    baseUrl: this.baseUrl,
                    user   : this.user,
                    token  : this.token
                };

                try {
                    let message = await MessageService.send({type: 'server.create', payload});
                    if(message.getType() === 'server.item') {
                        ToastService.success('ServerCreatedMessage', 'ServerSaveTitle')
                                    .catch(ErrorManager.catch);
                        this.$emit('create');
                    } else {
                        let payload = message.getPayload(),
                            text    = payload.message;
                        if(payload.errors) {
                            for(let key in payload.errors) {
                                if(payload.errors.hasOwnProperty(key)) text += ' ' + payload.errors[key];
                            }
                        }

                        ToastService.error(text, 'ServerSaveErrorTitle')
                                    .catch(ErrorManager.catch);
                    }
                } catch(e) {
                    ErrorManager.logError(e);
                    ToastService.error(e.message, 'ServerSaveErrorTitle').catch(ErrorManager.catch);
                }

                this.submitting = false;
            }
        }
    };
</script>