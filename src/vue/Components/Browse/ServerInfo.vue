<template>
    <div>
        <server-url-property property="url" :value="server.getBaseUrl()"/>
        <server-property property="user" :value="server.getUser()"/>
        <server-property :property="key" :value="value" v-for="(value, key) in info" :key="key"/>
    </div>
</template>

<script>
    import Server from '@js/Models/Server/Server';
    import MessageService from '@js/Services/MessageService';
    import ServerProperty from '@vue/Components/Browse/ServerProperty';
    import ServerUrlProperty from '@vue/Components/Browse/ServerUrlProperty';

    export default {
        components: {ServerUrlProperty, ServerProperty},
        props     : {
            server: {
                type: Server
            }
        },

        data() {
            return {
                info: {}
            };
        },

        mounted() {
            this.getServerInfo();
        },

        methods: {
            getServerInfo() {
                MessageService
                    .send({type: 'server.info', payload: this.server.getId()})
                    .then((message) => {
                        this.info = message.getPayload();
                        this.$forceUpdate();
                    });
            }
        },

        watch: {
            server() {
                this.getServerInfo();
            }
        }
    };
</script>