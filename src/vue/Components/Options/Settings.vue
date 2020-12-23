<template>
    <div class="settings-general">
        <translate tag="h3" say="AutofillSettings"/>
        <div class="setting">
            <slider-field id="popup-autoclose" v-model="autoclose"/>
            <translate tag="label" for="popup-autoclose" say="SettingsPopupAutoclose"/>
        </div>
        <div class="setting">
            <slider-field id="popup-autosubmit" v-model="autosubmit"/>
            <translate tag="label" for="password-autosubmit" say="SettingsPasswordAutosubmit"/>
        </div>

        <translate tag="h3" say="NotificationSettings"/>
        <div class="setting">
            <slider-field id="notification-password-new" v-model="notifyPwNew"/>
            <translate tag="label" for="notification-password-new" say="SettingsNotifyPasswordNew"/>
        </div>
        <div class="setting">
            <slider-field id="notification-password-update" v-model="notifyPwUpdate"/>
            <translate tag="label" for="notification-password-update" say="SettingsNotifyPasswordUpdate"/>
        </div>

        <translate tag="h3" say="SearchSettings"/>
        <div class="setting">
            <slider-field id="popup-related-search" v-model="relatedSearch"/>
            <translate tag="label" for="popup-related-search" say="SettingsPopupRelatedSearch"/>
        </div>
    </div>
</template>

<script>
    import Translate from '@vue/Components/Translate';
    import ErrorManager from '@js/Manager/ErrorManager';
    import SettingsService from '@js/Services/SettingsService';
    import ToastService from '@js/Services/ToastService';
    import SliderField from "@vue/Components/Form/SliderField";

    export default {
        components: {SliderField, Translate},
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
.debug-settings,
.settings-general {
    h3 {
        margin : 1.5rem 1rem .5rem;
    }

    .setting {
        padding     : 0.5rem 1rem;
        display     : flex;
        align-items : center;
        gap         : .25rem;

        label {
            line-height : 2rem;
            flex-grow   : 1;
            cursor      : pointer;
        }

        .input-slider {
            flex-grow : 0;
        }
    }
}
</style>