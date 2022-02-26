<template>
    <div>
        <div class="account-options" v-if="serverOptions.length > 2">
            <div>
                <translate tag="label" for="master-account" say="SettingsAccountsMain"/><select-field id="master-account" v-model="defaultServer" :options="serverOptions" :required="true" />
            </div>
        </div>
        <account-list :servers="servers" :defaultServer="defaultServer" v-on:change="loadData"/>
    </div>
</template>

<script>
    import Icon from '@vue/Components/Icon';
    import Foldout from '@vue/Components/Foldout';
    import Translate from '@vue/Components/Translate';
    import MessageService from '@js/Services/MessageService';
    import AccountList from '@vue/Components/Accounts/AccountList';
    import SettingsService from '@js/Services/SettingsService';
    import ErrorManager from '@js/Manager/ErrorManager';
    import SelectField from "@vue/Components/Form/SelectField";

    export default {
        components: {SelectField, AccountList, Foldout, Translate, Icon},
        data() {
            return {
                servers      : [],
                defaultServer: undefined
            };
        },

        computed: {
            serverOptions() {
                let options = [
                    {
                        id: undefined,
                        disabled: true,
                        label: "Please select"
                    }
                ];

                for(let server of this.servers) {
                    options.push(
                        {
                            id      : server.getId(),
                            disabled: !server.getEnabled(),
                            label   : server.getLabel()
                        }
                    );
                }

                return options;
            }
        },

        created() {
            this.loadData();
        },

        methods: {
            async loadData() {
                try {
                    let message = await MessageService.send({type: 'server.list', payload: {all: true}});
                    this.servers = message.getPayload();
                    this.defaultServer = await SettingsService.getValue('server.default');
                } catch(e) {
                    console.error(e);
                }
            }
        },

        watch: {
            defaultServer(value, oldValue) {
                if(oldValue !== undefined && value !== oldValue) {
                    SettingsService.set('server.default', value).catch(ErrorManager.catch);
                }
            }
        }
    };
</script>

<style lang="scss">
.account-options,
.account-form fieldset {
    
    padding     : 0.5rem 1rem;

    div {
        display: flex;
        justify-content: flex-end;
    }

    label {
        flex: 1;
        white-space: nowrap;
        align-self: center;
    }

    input {
        flex: 4;
    }

    .input-select {
        flex: 2;
        padding: 0.5rem;
    }

    select {
        width: 100%;
    }
}
</style>