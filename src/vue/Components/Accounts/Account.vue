<template>
    <form class="account-settings" v-on:submit.prevent="save()">
        <translate tag="label" :for="`${id}-label`" say="ServerLabel"/>
        <input type="text" :id="`${id}-label`" v-model="label"/>
        <translate tag="label" :for="`${id}-url`" say="ServerBaseUrl"/>
        <input type="text" :id="`${id}-url`" v-model="url"/>
        <translate tag="label" :for="`${id}-user`" say="ServerUser"/>
        <input type="text" :id="`${id}-user`" v-model="user"/>
        <translate tag="label" :for="`${id}-token`" say="ServerToken"/>
        <input type="button" value="Change" :id="`${id}-token`" v-if="!changeToken" @click="editToken()"/>
        <input type="text" :id="`${id}-token`" v-model="token" v-else/>
    </form>
</template>

<script>
    import Server from '@js/Models/Server/Server';
    import Translate from '@vue/Components/Translate';
    import SystemService from '@js/Services/SystemService';
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
                changeToken: false
            };
        },

        methods: {
            save() {
                this.server
                    .setLabel(this.label)
                    .setBaseUrl(this.url)
                    .setUser(this.user);

                if(this.changeToken) {
                    this.server.setToken(this.token);
                }

                this.$emit('change');
                alert('This action is not implemented. Please delete the server and create a new one.');
            },

            /**
             */
            async remove() {
                if(SystemService.getBrowserPlatform() === 'chrome' || confirm(`Do you really want to delete ${this.server.getLabel()}?`)) {
                    let message = await MessageService.send(
                        {
                            type   : 'server.delete',
                            payload: {server: this.server.getId()}
                        }
                    );
                    if(message.getType() !== 'delete.success') {
                        alert(message.getPayload().message);
                    }

                    this.$emit('change');
                }
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