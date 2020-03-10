<template>
    <div class="settings-general">
        <translate tag="h3" say="AutofillSettings"/>
        <div class="account-options">
            <translate tag="label" for="popup-autoclose" say="SettingsPopupAutoclose"/>
            <input type="checkbox" id="popup-autoclose" v-model="autoclose"/>
        </div>
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

        <translate tag="h3" say="SearchSettings"/>
        <div class="account-options">
            <translate tag="label" for="popup-related-search" say="SettingsPopupRelatedSearch"/>
            <input type="checkbox" id="popup-related-search" v-model="relatedSearch"/>
        </div>
    </div>
</template>

<script>
    import Translate from '@vue/Components/Translate';
    import ErrorManager from '@js/Manager/ErrorManager';
    import SettingsService from '@js/Services/SettingsService';
    import ToastService from '@js/Services/ToastService';

    export default {
        components: {Translate},
        data() {
            return {
                autoclose     : false,
                autosubmit    : false,
                notifyPwNew   : false,
                relatedSearch : false,
                notifyPwUpdate: false
            };
        },

        created() {
            this.loadData();
        },

        methods: {
            loadData() {
                this.getSetting('popup.autoclose', 'autoclose');
                this.getSetting('password.autosubmit', 'autosubmit');
                this.getSetting('popup.related.search', 'relatedSearch');
                this.getSetting('notification.password.new', 'notifyPwNew');
                this.getSetting('notification.password.update', 'notifyPwUpdate');
            },
            async getSetting(name, variable) {
                try {
                    this[variable] = await SettingsService.getValue(name);
                } catch(e) {
                    ErrorManager.logError(e);
                    ToastService.error(e.message).catch(ErrorManager.catch);
                }
            },
            async setSetting(name, value) {
                try {
                    await SettingsService.set(name, value);
                } catch(e) {
                    ErrorManager.logError(e);
                    ToastService.error(e.message).catch(ErrorManager.catch);
                }
            }
        },

        watch: {
            autosubmit(value, oldValue) {
                if(oldValue !== null && value !== oldValue) {
                    this.setSetting('password.autosubmit', value);
                }
            },
            autoclose(value, oldValue) {
                if(oldValue !== null && value !== oldValue) {
                    this.setSetting('popup.autoclose', value);
                }
            },
            relatedSearch(value, oldValue) {
                if(oldValue !== null && value !== oldValue) {
                    this.setSetting('popup.related.search', value);
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