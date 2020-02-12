<template>
    <div>
        Label: {{server.getLabel()}}<br>
        Url: {{server.getBaseUrl()}}<br>
        User: {{server.getUser()}}<br>
        <div v-for="(value, key) in info" :key="key">
            {{key}}: {{value}}
        </div>
    </div>
</template>

<script>
    import Server from '@js/Models/Server/Server';
    import MessageService from '@js/Services/MessageService';

    export default {
        props: {
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

<style scoped>

</style>