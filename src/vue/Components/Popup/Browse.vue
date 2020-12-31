<template>
    <div class="browse-container">
        <foldout :tabs="serverNames" :translate="false" ref="foldout" v-on:switch="switchTab($event)">
            <div v-for="server in servers" :key="`${server.getId()}-tab`" :slot="`${server.getId()}-tab`" class="options">
                <div class="option" @click="reloadServer(server)">
                    <icon icon="sync" font="solid" :spin="reloading[server.getId()]"/>
                </div>
            </div>
            <div v-for="server in servers"
                 :key="`${server.getId()}-tab-open`"
                 :slot="`${server.getId()}-tab-open`"
                 class="options">
                <icon icon="info-circle" font="solid" @click="showInfo(server)"/>
            </div>
            <div v-for="server in servers" :key="server.getId()" :slot="server.getId()">
                <server-info :server="server" v-if="info"/>
                <server-browser :server="server" :folder="getInitialFolder(server)" v-on:open="setFolder($event)" v-else/>
            </div>
        </foldout>
        <translate tag="div" class="browse-no-servers" say="BrowseNoServers" v-if="servers.length === 0"/>
    </div>
</template>

<script>
    import Foldout from '@vue/Components/Foldout';
    import Icon from '@vue/Components/Icon';
    import MessageService from '@js/Services/MessageService';
    import ServerInfo from '@vue/Components/Browse/ServerInfo';
    import ServerBrowser from '@vue/Components/Browse/ServerBrowser';
    import Translate from "@vue/Components/Translate";

    export default {
        components: {Translate, ServerInfo, ServerBrowser, Icon, Foldout},

        props: {
            initialStatus: {
                type   : Object,
                default: () => {
                    return {
                        server: null,
                        info  : false,
                        folder: null
                    };
                }
            }
        },

        data() {
            return {
                servers  : [],
                reloading: {},
                info     : false,
                current  : null,
                folder   : null
            };
        },

        async mounted() {
            await this.loadServers();
            if(this.initialStatus.server !== null && this.serverNames.hasOwnProperty(this.initialStatus.server)) {
                this.$refs.foldout.setActive(this.initialStatus.server);
                if(this.initialStatus.info) this.info = true;
            }
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
                }

                return names;
            }
        },

        methods: {
            async loadServers() {
                let message = await MessageService.send('server.list');
                this.servers = message.getPayload();
            },
            getInitialFolder(server) {
                if(server.getId() === this.initialStatus.server) {
                    return this.initialStatus.folder;
                }

                return null;
            },
            showInfo() {
                this.info = !this.info;
                this.folder = null;
            },
            async reloadServer(server) {
                if(this.reloading[server.getId()]) return;
                this.reloading[server.getId()] = true;
                this.$forceUpdate();
                await MessageService.send({type: 'server.reload', payload: server.getId()});
                this.reloading[server.getId()] = false;
                this.$forceUpdate();
            },
            switchTab($event) {
                this.info = false;
                this.folder = null;
                this.current = $event.tab;
            },
            setFolder($event) {
                this.info = false;
                this.folder = $event.folder;
            },
            sendStatus() {
                let status = {
                    server: this.current,
                    info  : this.info,
                    folder: this.folder
                };
                MessageService
                    .send({type: 'popup.status.set', payload: {tab: 'browse', status}});
            }
        },

        watch: {
            info() {
                this.sendStatus();
            },
            current() {
                this.sendStatus();
            },
            folder() {
                this.sendStatus();
            }
        }
    };
</script>

<style lang="scss">
.tab-content-browse {
    .foldout-tab.active {
        position : sticky;
        top      : 0;
    }

    .browse-no-servers {
        text-align : center;
        padding    : 1rem;
    }
}
</style>