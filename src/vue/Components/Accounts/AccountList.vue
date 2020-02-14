<template>
    <div class="account-list">
        <translate tag="h3" say="AccountList">
            <icon icon="user-plus" font="solid" @click="showCreateForm" v-if="!addServer"/>
        </translate>
        <foldout :tabs="serverNames" :translate="false" :initial-open="open" ref="foldout" v-if="servers.length !== 0 || addServer">
            <icon v-for="server in servers"
                  :key="`${server.getId()}-tab-open`"
                  :slot="`${server.getId()}-tab-open`"
                  icon="save"
                  v-on:click.prevent="save(server)"/>
            <icon v-for="server in servers"
                  :key="`${server.getId()}-tab-closed`"
                  :slot="`${server.getId()}-tab-closed`"
                  icon="trash-alt"
                  v-on:click.prevent="remove(server)"/>
            <account v-for="server in servers"
                     :server="server"
                     :key="server.getId()"
                     :slot="server.getId()"
                     :ref="server.getId()"
                     v-on:change="onSave"/>

            <icon slot="create-tab-open" icon="save" v-on:click.prevent="create()"/>
            <new-account slot="create" ref="create" v-on:create="onCreate" v-if="addServer"/>
        </foldout>
        <translate tag="div" class="no-accounts" say="NoAccounts" @click="showCreateForm" v-else/>
    </div>
</template>

<script>
    import Icon from '@vue/Components/Icon';
    import Foldout from '@vue/Components/Foldout';
    import Translate from '@vue/Components/Translate';
    import Account from '@vue/Components/Accounts/Account';
    import NewAccount from '@vue/Components/Accounts/NewAccount';
    import LocalisationService from '@js/Services/LocalisationService';

    export default {
        components: {Account, NewAccount, Foldout, Translate, Icon},

        props: {
            servers: {
                type: Array
            }
        },

        data() {
            return {
                addServer: false,
                open: false,
            };
        },

        computed: {
            serverNames() {
                let names = {};

                for(let server of this.servers) {
                    names[server.getId()] = server.getLabel();
                }

                if(this.addServer) {
                    names.create = LocalisationService.translate('NewServer');
                }

                return names;
            }
        },
        methods : {
            showCreateForm() {
                this.addServer = true;

                if(this.$refs.foldout) {
                    this.$refs.foldout.setActive('create');
                } else {
                    this.open = true;
                }
            },
            save(server) {
                this.$refs[server.getId()][0].save();
            },
            remove(server) {
                this.$refs[server.getId()][0].remove();
            },
            create() {
                this.$refs.create.save();
            },
            onCreate() {
                this.open = false;
                this.addServer = false;

                this.$emit('change');
            },
            onSave() {
                this.$emit('change');
            }
        }
    };
</script>

<style lang="scss">
    .account-list {
        h3 {
            margin : 1.5rem 1rem .5rem 1rem;

            .icon {
                float  : right;
                cursor : pointer;
            }
        }

        .no-accounts {
            padding : 1rem;
            cursor  : pointer;
        }
    }
</style>