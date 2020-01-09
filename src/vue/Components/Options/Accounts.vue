<template>
    <div>
        <div class="account-options">
            <translate tag="label" for="master-account" say="SettingsAccountsMain"/>
            <select id="master-account">
                <option v-for="server in servers" :key="server.getId()" :value="server.getId()">
                    {{server.getLabel()}}
                </option>
            </select>
        </div>
        <foldout :tabs="serverNames">
            <form v-for="server in servers"
                  :key="server.getId()"
                  :slot="server.getId()"
                  class="account-settings"
                  v-on:submit.prevent="saveServer(server)">
                <translate tag="label" :for="`${server.getId()}-name`" say="AccountLabel"/>
                <input type="text" :id="`${server.getId()}-name`" v-model="server.getLabel()"/>
                <translate tag="label" :for="`${server.getId()}-url`" say="AccountBaseUrl"/>
                <input type="text" :id="`${server.getId()}-url`" v-model="server.getBaseUrl()"/>
                <translate tag="label" :for="`${server.getId()}-user`" say="AccountUser"/>
                <input type="text" :id="`${server.getId()}-user`" v-model="server.getUser()"/>
                <translate tag="label" :for="`${server.getId()}-token`" say="AccountToken"/>
                <input type="button" value="Change" :id="`${server.getId()}-token`"/>
            </form>
            <icon v-for="server in servers"
                  :key="server.getId()"
                  :slot="`${server.getId()}-tab-open`"
                  icon="save"
                  v-on:click.prevent="saveServer(server)"/>
            <icon v-for="server in servers"
                  :key="server.getId()"
                  :slot="`${server.getId()}-tab-closed`"
                  icon="trash-alt"
                  v-on:click.prevent="deleteServer(server)"/>

            <form v-if="showNewForm"
                  slot="addserver"
                  class="account-settings"
                  v-on:submit.prevent="createServer($event)">
                <translate tag="label" for="new-name" say="AccountLabel"/>
                <input type="text" id="new-name" v-model="newServer.label" required/>
                <translate tag="label" for="new-url" say="AccountBaseUrl"/>
                <input type="text" id="new-url" v-model="newServer.baseUrl" required/>
                <translate tag="label" for="new-user" say="AccountUser"/>
                <input type="text" id="new-user" v-model="newServer.user" required/>
                <translate tag="label" for="new-token" say="AccountToken"/>
                <input type="text"
                       value="Change"
                       id="new-token"
                       v-model="newServer.token"
                       required
                       pattern="([A-Za-z0-9]{5}-?){5}"
                       placeholder="xxxxx-xxxxx-xxxxx-xxxxx-xxxxx"/>
                <input type="submit"/>
            </form>
        </foldout>
        <translate tag="button" say="Add a server" @click="addServer" v-if="!showNewForm"/>
    </div>
</template>

<script>
    import Translate from '@vue/Components/Translate';
    import Foldout from '@vue/Components/Foldout';
    import Icon from '@vue/Components/Icon';
    import MessageService from '@js/Services/MessageService';
    import SystemService from '@js/Services/SystemService';

    export default {
        components: {Foldout, Translate, Icon},
        data() {
            return {
                servers    : [],
                showNewForm: false,
                newServer  : {
                    label  : '',
                    baseUrl: '',
                    user   : '',
                    token  : ''
                }
            };
        },

        created() {
            this.loadData();
        },

        computed: {
            serverNames() {
                let names = {};

                for(let server of this.servers) {
                    names[server.getId()] = server.getLabel();
                }

                if(this.showNewForm) {
                    names.addserver = 'New Account';
                }

                return names;
            }
        },

        methods: {
            async loadData() {
                try {
                    let message = await MessageService.send({type: 'server.list'});
                    this.servers = message.getPayload();
                } catch(e) {

                }
            },
            addServer() {
                this.showNewForm = true;
            },

            /**
             *
             * @param {Server} server
             */
            async saveServer(server) {
                alert('This is not yet implemented. Please use delete and create.');
            },

            /**
             * @param {Server} server
             */
            async deleteServer(server) {
                if(SystemService.getBrowserPlatform() === 'chrome' ||confirm(`Do you really want to delete ${server.getLabel()}?`)) {
                    let message = await MessageService.send({type: 'server.delete', payload: {server: server.getId()}});
                    if(message.getType() === 'delete.success') {
                        this.loadData();
                    } else {
                        alert(message.getPayload().message);
                        this.loadData();
                    }
                }
            },

            /**
             *
             * @param {Event} event
             */
            async createServer(event) {
                let message = await MessageService.send({type: 'server.create', payload: this.newServer});
                if(message.getType() === 'server.item') {
                    this.servers.push(message.getPayload());
                    this.showNewForm = false;
                } else {
                    alert(message.getPayload().message);
                }
            }
        }
    };
</script>

<style lang="scss">
    .account-options,
    .account-settings {
        display               : grid;
        grid-template-columns : 2fr 1fr;
        grid-row-gap          : 0.5rem;
        padding               : 0.5rem 1rem;

        label {
            line-height : 2rem;
        }
    }
</style>