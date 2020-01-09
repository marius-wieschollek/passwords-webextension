<template>
    <foldout :tabs="serverNames">
        <icon v-for="server in servers" :key="server.getId()" :slot="`${server.getId()}-tab`" icon="sync" font="solid"/>
        <div v-for="server in servers" :key="server.getId()" :slot="server.getId()" class="account-settings">
            Label: {{server.getLabel()}}<br>
            Url: {{server.getBaseUrl()}}<br>
            User: {{server.getUser()}}<br>
        </div>
    </foldout>
</template>

<script>
    import Foldout from '@vue/Components/Foldout';
    import Icon from '@vue/Components/Icon';
    import MessageService from '@js/Services/MessageService';

    export default {
        components: {Icon, Foldout},
        data() {
            return {
                servers: []
            };
        },

        mounted() {
            this.loadServers();
        },

        computed: {
            serverNames() {
                let names = {};

                for(let server of this.servers) {
                    names[server.getId()] = server.getLabel();
                }

                return names;
            }
        },

        methods: {
            async loadServers() {
                MessageService
                    .send({type: 'server.list'})
                    .then((r) => {
                        this.servers = r.getPayload();
                    });
            }
        }
    };
</script>

<style scoped>

</style>