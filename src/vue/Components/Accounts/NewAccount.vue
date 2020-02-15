<template>
    <form class="account-form" v-on:submit.prevent="save()">
        <div class="error" v-if="error">{{error}}</div>

        <fieldset :disabled="submitting">
            <translate tag="label" for="new-name" say="ServerLabel"/>
            <input type="text" id="new-name" v-model="label" required/>
            <translate tag="label" for="new-url" say="ServerBaseUrl"/>
            <input type="text" id="new-url" v-model="baseUrl" required/>
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

    export default {
        components: {Translate},
        data() {
            return {
                submitting: false,
                label     : '',
                baseUrl   : '',
                user      : '',
                token     : '',
                error     : ''
            };
        },

        activated() {
            this.error = '';
        },

        methods: {
            /**
             *
             */
            async save() {
                if(!this.$el.reportValidity() || this.submitting) return;

                this.submitting = true;
                this.error = '';
                let payload = {
                    label  : this.label,
                    baseUrl: this.baseUrl,
                    user   : this.user,
                    token  : this.token
                };

                try {
                    let message = await MessageService.send({type: 'server.create', payload});
                    if(message.getType() === 'server.item') {
                        this.$emit('create');
                    } else {
                        this.error = message.getPayload().message;
                    }
                } catch(e) {
                    this.error = e.message;
                }

                this.submitting = false;
            }
        }
    };
</script>