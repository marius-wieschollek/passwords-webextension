<template>
    <foldout :tabs="serverNames" :translate="false">
        <div v-for="server in servers" :key="server.getId()" :slot="`${server.getId()}-tab`" class="options">
            <div class="option" @click="reloadServer(server)">
                <icon icon="sync" font="solid" :spin="reloading[server.getId()]"/>
            </div>
        </div>
        <div v-for="server in servers" :key="server.getId()" :slot="`${server.getId()}-tab-open`" class="options">
            <icon icon="info-circle" font="solid" @click="showInfo(server)"/>
        </div>
        <div v-for="server in servers" :key="server.getId()" :slot="server.getId()">
            <server-info :server="server" v-if="info[server.getId()]"/>
            <server-browser :server="server" v-else/>
        </div>
    </foldout>
</template>

<script>
    import Foldout from '@vue/Components/Foldout';
    import Icon from '@vue/Components/Icon';
    import MessageService from '@js/Services/MessageService';
    import ServerInfo from '@vue/Components/Browse/ServerInfo';
    import ServerBrowser from '@vue/Components/Browse/ServerBrowser';

    export default {
        components: {ServerInfo, ServerBrowser, Icon, Foldout},
        data() {
            return {
                servers  : [],
                reloading: {},
                info     : {}
            };
        },

        mounted() {
            this.loadServers();
        },

        async activated() {
            await this.loadServers();
        },

        computed: {
            serverNames() {
                let names = {};

                for(let server of this.servers) {
                    names[server.getId()] = server.getLabel();
                    this.reloading[server.getId()] = false;
                    this.info[server.getId()] = false;
                }

                return names;
            }
        },

        methods: {
            async loadServers() {
                let message = await MessageService.send({type: 'server.list'});
                this.servers = message.getPayload();
            },
            showInfo(server) {
                this.info[server.getId()] = !this.info[server.getId()];
                this.$forceUpdate();
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
    .tab-content-browse {
        .foldout-tab.active {
            position: sticky;
            top: 0;
        }
    }
</style>