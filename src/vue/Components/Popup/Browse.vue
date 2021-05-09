<template>
    <div class="browse-container">
        <foldout :tabs="serverNames" :translate="false" ref="foldout" v-on:switch="switchTab($event)" v-if="servers.length !== 0">
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
                <server-browser :server="server" :folder="folder" v-on:open="setFolder($event)" v-else/>
            </div>
        </foldout>
        <translate tag="div" class="browse-no-servers" say="BrowseNoServers" v-else/>
    </div>
</template>

<script>
    import Foldout from '@vue/Components/Foldout';
    import Icon from '@vue/Components/Icon';
    import MessageService from '@js/Services/MessageService';
    import ServerInfo from '@vue/Components/Browse/ServerInfo';
    import ServerBrowser from '@vue/Components/Browse/ServerBrowser';
    import Translate from '@vue/Components/Translate';
    import PopupStateService from '@js/Services/PopupStateService';

    export default {
        components: {Translate, ServerInfo, ServerBrowser, Icon, Foldout},

        data() {
            return {
                servers  : [],
                reloading: {},
                info     : false,
                current  : PopupStateService.get('current'),
                folder   : null
            };
        },

        async mounted() {
            await this.loadServers();
            if(this.current !== null && this.serverNames.hasOwnProperty(this.current)) {
                let {folder, info} = PopupStateService.get(['folder', 'info']);
                this.$refs.foldout.setActive(this.current);
                this.folder = folder;
                this.info = info;
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
            showInfo() {
                this.info = !this.info;
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
                PopupStateService
                    .set({
                             current: this.current,
                             info   : this.info,
                             folder : this.folder
                         });
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