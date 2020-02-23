<template>
    <div class="settings-general">
        <div class="account-options">
            <translate tag="label" for="password-autosubmit" say="SettingsPasswordAutosubmit"/>
            <input type="checkbox" id="password-autosubmit" v-model="autosubmit"/>
        </div>

        <translate tag="h3" say="NotificationSettings"/>
        <div class="account-options">
            <translate tag="label" for="notification-password-new" say="SettingsNotifyPasswordNew"/>
            <input type="checkbox" id="notification-password-new" v-model="notifyPwNew"/>

            <translate tag="label" for="notification-password-update" say="SettingsNotifyPasswordUpdate"/>
            <input type="checkbox" id="notification-password-update" v-model="notifyPwUpdate"/>
        </div>
    </div>
</template>

<script>
    import Translate from '@vue/Components/Translate';
    import MessageService from '@js/Services/MessageService';
    import ErrorManager from '@js/Manager/ErrorManager';

    export default {
        components: {Translate},
        data() {
            return {
                autosubmit    : false,
                notifyPwNew   : false,
                notifyPwUpdate: false
            };
        },

        created() {
            this.loadData();
        },

        methods: {
            async loadData() {
                this.getSetting('password.autosubmit', 'autosubmit');
                this.getSetting('notification.password.new', 'notifyPwNew');
                this.getSetting('notification.password.update', 'notifyPwUpdate');
            },
            async getSetting(name, variable) {
                try {
                    let message = await MessageService.send({type: 'setting.get', payload: name});
                    this[variable] = message.getPayload();
                } catch(e) {
                    ErrorManager.logError(e);
                }
            },
            async setSetting(name, value) {
                try {
                    await MessageService.send({type: 'setting.set', payload: {setting: name, value}});
                } catch(e) {
                    ErrorManager.logError(e);
                }
            }
        },

        watch: {
            autosubmit(value, oldValue) {
                if(oldValue !== null && value !== oldValue) {
                    this.setSetting('password.autosubmit', value);
                }
            },
            notifyPwNew(value, oldValue) {
                if(oldValue !== null && value !== oldValue) {
                    this.setSetting('notification.password.new', value);
                }
            },
            notifyPwUpdate(value, oldValue) {
                if(oldValue !== null && value !== oldValue) {
                    this.setSetting('notification.password.update', value);
                }
            }
        }
    };
</script>

<style lang="scss">
    .settings-general {
        h3 {
            margin : 1.5rem 1rem .5rem;
        }
    }
</style>