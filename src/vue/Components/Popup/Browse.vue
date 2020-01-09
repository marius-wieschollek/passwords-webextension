<template>
    <foldout :tabs="serverNames">
        <div v-for="server in servers"
             :key="server.getId()"
             :slot="`${server.getId()}-tab`"
             @click="reloadServer(server)"
             class="option">
            <icon icon="sync" font="solid" :spin="reloading[server.getId()]"/>
        </div>
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
                servers  : [],
                reloading: {}
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
                    this.reloading[server.getId()] = false;
                }

                return names;
            }
        },

        methods: {
            async loadServers() {
                let message = await MessageService.send({type: 'server.list'});
                this.servers = message.getPayload();
            },
            async reloadServer(server) {
                this.reloading[server.getId()] = true;
                this.$forceUpdate();
                await MessageService.send({type: 'server.reload', payload: server.getId()});
                this.reloading[server.getId()] = false;
                this.$forceUpdate();
            }
        }
    };
</script>

<style lang="scss">
    .option .icon {
        display : block;
    }
</style>