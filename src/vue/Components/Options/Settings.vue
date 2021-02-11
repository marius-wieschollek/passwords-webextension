<template>
    <div class="settings-general">
        <translate tag="h3" say="AutofillSettings"/>
        <div class="setting">
            <slider-field id="paste-autoclose" v-model="autoclose"/>
            <translate tag="label" for="paste-autoclose" say="SettingsPastePopupClose"/>
        </div>
        <div class="setting">
            <slider-field id="paste-autosubmit" v-model="autosubmit"/>
            <translate tag="label" for="paste-autosubmit" say="SettingsPasteFormSubmit"/>
        </div>
        <div class="setting">
            <slider-field id="paste-compromised" v-model="compromised"/>
            <translate tag="label" for="paste-compromised" say="SettingsPasteWarnCompromised"/>
        </div>
        <div class="setting">
            <slider-field id="paste-autofill" v-model="autofill"/>
            <translate tag="label" for="paste-autofill" say="SettingsPasteAutofillEnabled"/>
            <help-text type="warning" text="HelpPasteAutofill"/>
        </div>
        <div class="setting">
            <slider-field id="paste-basic-auth" v-model="basicAuth"/>
            <translate tag="label" for="paste-basic-auth" say="SettingsPasteBasicAuth"/>
            <help-text type="warning" text="HelpPasteBasicAuth"/>
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
    import HelpText from "@vue/Components/Options/Setting/HelpText";

    export default {
        components: {HelpText, SliderField, Translate},
        data() {
            return {
                autoclose     : false,
                autosubmit    : false,
                autofill      : false,
                basicAuth     : false,
                compromised   : false,
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
                this.getSetting('paste.popup.close', 'autoclose');
                this.getSetting('paste.form.submit', 'autosubmit');
                this.getSetting('paste.compromised.warning', 'compromised');
                this.getSetting('paste.autofill', 'autofill');
                this.getSetting('paste.basic-auth', 'basicAuth');
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
                    this.setSetting('paste.form.submit', value);
                }
            },
            autoclose(value, oldValue) {
                if(oldValue !== null && value !== oldValue) {
                    this.setSetting('paste.popup.close', value);
                }
            },
            compromised(value, oldValue) {
                if(oldValue !== null && value !== oldValue) {
                    this.setSetting('paste.compromised.warning', value);
                }
            },
            autofill(value, oldValue) {
                if(oldValue !== null && value !== oldValue) {
                    this.setSetting('paste.autofill', value);
                }
            },
            basicAuth(value, oldValue) {
                if(oldValue !== null && value !== oldValue) {
                    this.setSetting('paste.basic-auth', value);
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

        .settings-help-text {
            margin-right : -.5rem;
        }
    }
}
</style>