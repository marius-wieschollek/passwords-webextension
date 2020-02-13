<template>
    <div class="account-options">
        <translate tag="label" for="password-autosubmit" say="SettingsPasswordAutosubmit"/>
        <input type="checkbox" id="password-autosubmit" v-model="autosubmit"/>
    </div>
</template>

<script>
    import Translate from '@vue/Components/Translate';
    import MessageService from '@js/Services/MessageService';

    export default {
        components: {Translate},
        data() {
            return {
                autosubmit: false
            };
        },

        created() {
            this.loadData();
        },

        methods: {
            async loadData() {
                try {
                    let message = await MessageService.send({type: 'setting.get', payload: 'sync.password.autosubmit'});
                    this.autosubmit = message.getPayload();
                } catch(e) {
                    console.error(e);
                }
            }
        },

        watch  : {
            autosubmit(value, oldValue) {
                if(oldValue !== null && value !== oldValue) {
                    MessageService.send({type: 'setting.set', payload: {setting: 'sync.password.autosubmit', value}});
                }
            }
        }
    };
</script>