<template>
    <div>
        <div class="account-options">
            <translate tag="label" for="master-account" say="SettingsAccountsMain"/>
            <select id="master-account" v-model="defaultServer">
                <option v-for="server in servers" :key="server.getId()" :value="server.getId()" :disabled="server.getEnabled()">
                    {{server.getLabel()}}
                </option>
            </select>
        </div>
        <account-list :servers="servers" v-on:change="loadData"/>
    </div>
</template>

<script>
    import Icon from '@vue/Components/Icon';
    import Foldout from '@vue/Components/Foldout';
    import Translate from '@vue/Components/Translate';
    import MessageService from '@js/Services/MessageService';
    import AccountList from '@vue/Components/Accounts/AccountList';

    export default {
        components: {AccountList, Foldout, Translate, Icon},
        data() {
            return {
                servers      : [],
                defaultServer: undefined
            };
        },

        created() {
            this.loadData();
        },

        methods: {
            async loadData() {
                try {
                    let message = await MessageService.send({type: 'server.list', payload: {all: true}});
                    this.servers = message.getPayload();
                    message = await MessageService.send({type: 'setting.get', payload: 'server.default'});
                    this.defaultServer = message.getPayload();
                } catch(e) {
                    console.error(e);
                }
            }
        },

        watch: {
            defaultServer(value, oldValue) {
                if(oldValue !== undefined && value !== oldValue) {
                    MessageService.send({type: 'setting.set', payload: {setting: 'server.default', value}});
                }
            }
        }
    };
</script>

<style lang="scss">
    .account-options,
    .account-form fieldset {
        display               : grid;
        grid-template-columns : 2fr 1fr;
        grid-row-gap          : 0.5rem;
        padding               : 0.5rem 1rem;

        label {
            line-height : 2rem;
        }
    }
</style>