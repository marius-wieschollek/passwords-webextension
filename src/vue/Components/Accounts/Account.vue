<template>
    <form class="account-form" v-on:submit.prevent="save()">
        <div class="error" v-if="error">{{error}}</div>
        <translate tag="div" class="success" say="ServerSaveSuccess" v-if="success"/>

        <fieldset :disabled="submitting">
            <translate tag="label" :for="`${id}-label`" say="ServerLabel" required/>
            <input type="text" :id="`${id}-label`" v-model="label"/>
            <translate tag="label" :for="`${id}-url`" say="ServerBaseUrl" required/>
            <input type="text" :id="`${id}-url`" v-model="url"/>
            <translate tag="label" :for="`${id}-user`" say="ServerUser" required/>
            <input type="text" :id="`${id}-user`" v-model="user"/>
            <translate tag="label" :for="`${id}-token`" say="ServerToken" required/>
            <input type="button" value="Change" :id="`${id}-token`" v-if="!changeToken" @click="editToken()"/>
            <input type="text" :id="`${id}-token`" v-model="token"
                   required
                   pattern="([A-Za-z0-9]{5}-?){5}"
                   placeholder="xxxxx-xxxxx-xxxxx-xxxxx-xxxxx" v-else/>
        </fieldset>
    </form>
</template>

<script>
    import Server from '@js/Models/Server/Server';
    import Translate from '@vue/Components/Translate';
    import MessageService from '@js/Services/MessageService';

    export default {
        components: {Translate},

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
                token      : '',
                error      : '',
                success    : false,
                submitting : false,
                changeToken: false
            };
        },

        activated() {
            this.error = '';
            this.success = false;
        },

        methods: {
            async save() {
                if(!this.$el.reportValidity() || this.submitting) return;

                this.error = '';
                this.success = false;
                this.submitting = true;
                this.server
                    .setLabel(this.label)
                    .setBaseUrl(this.url)
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
                    this.error = e.message;
                    this.submitting = false;
                    return;
                }

                if(message.getType() === 'server.item') {
                    this.success = true;
                    this.token = '';
                    this.$emit('create');
                } else {
                    this.error = message.getPayload().message;
                }

                this.changeToken = false;
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
        .error,
        .success {
            background-color  : #eb3b5a;
            color             : white;
            grid-column-start : 1;
            grid-column-end   : 3;
            border-radius     : 3px;
            padding           : .5rem;
            margin            : .5rem
        }

        .success {
            background-color : #27ae60;
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