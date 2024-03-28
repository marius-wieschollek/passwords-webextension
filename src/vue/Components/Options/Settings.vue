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
        <div class="setting">
            <slider-field id="clipboard-clear-passwords" v-model="clearClipboard" @change="requestClipboardReadPermission(clearClipboard)"/>
            <translate tag="label" for="clipboard-clear-passwords" say="SettingsClearClipboardPasswords"/>
            <help-text type="info" text="HelpClearClipboardPasswords"/>
        </div>
        <div class="setting">
            <translate tag="label" for="clipboard-clear-delay" say="SettingsClearClipboardDelay"/>
            <select-field id="clipboard-clear-delay" :options="clearClipboardDelayOptions" v-model="clearClipboardDelay" :disabled="!clearClipboard"/>
        </div>
        <div class="setting setting-textarea">
            <translate tag="label" for="mining-autofill-domains" say="SettingsAutofillIgnoredDomains"/>
            <input-field type="textarea" id="mining-autofill-domains" v-model="autofillIgnoredDomains" placeholder="SettingsAutofillIgnoredDomainsPlaceholder"/>
        </div>

        <translate tag="h3" say="RecommendationSettings"/>
        <div class="setting">
            <translate tag="label" for="search-recommendation-option" say="SettingsSearchRecommendationOption"/>
            <select-field id="search-recommendation-option" :options="recommendationOptions" v-model="recSearchMode"/>
        </div>
        <div class="setting">
            <translate tag="label" for="search-recommendation-maxRows" say="SettingsSearchRecommendationMaxRows"/>
            <select-field id="search-recommendation-maxRows" :options="recommendationMaxRows" v-model="recSearchRows"/>
        </div>

        <translate tag="h3" say="UiSettings"/>
        <div class="setting">
            <slider-field id="show-username-in-list" v-model="showUserInList"/>
            <translate tag="label" for="show-username-in-list" say="SettingsShowUsernameInList"/>
        </div>

        <translate tag="h3" say="SearchSettings"/>
        <div class="setting">
            <slider-field id="popup-related-search" v-model="relatedSearch"/>
            <translate tag="label" for="popup-related-search" say="SettingsPopupRelatedSearch"/>
        </div>

        <translate tag="h3" say="PasswordMiningSettings"/>
        <div class="setting">
            <slider-field id="notification-password-new" v-model="notifyPwNew"/>
            <translate tag="label" for="notification-password-new" say="SettingsNotifyPasswordNew"/>
        </div>
        <div class="setting">
            <slider-field id="notification-password-update" v-model="notifyPwUpdate"/>
            <translate tag="label" for="notification-password-update" say="SettingsNotifyPasswordUpdate"/>
        </div>
        <div class="setting">
            <slider-field id="notification-password-quicksave" v-model="notificationQuickSave"/>
            <translate tag="label" for="notification-password-quicksave" say="SettingsNotifyPasswordQuicksave"/>
        </div>
        <div class="setting">
            <slider-field id="mining-incognito-hide" v-model="miningIncognitoHide"/>
            <translate tag="label" for="mining-incognito-hide" say="SettingsMiningIncognitoHide"/>
        </div>
        <div class="setting setting-textarea">
            <translate tag="label" for="mining-ignored-domains" say="SettingsMiningIgnoredDomains"/>
            <input-field type="textarea" id="mining-ignored-domains" v-model="miningIgnoredDomains" placeholder="SettingsMiningIgnoredDomainsPlaceholder"/>
        </div>
    </div>
</template>

<script>
    import Translate from '@vue/Components/Translate';
    import ErrorManager from '@js/Manager/ErrorManager';
    import SettingsService from '@js/Services/SettingsService';
    import ToastService from '@js/Services/ToastService';
    import SliderField from "@vue/Components/Form/SliderField";
    import SelectField from "@vue/Components/Form/SelectField";
    import HelpText from "@vue/Components/Options/Setting/HelpText";
    import ClipboardManager from '@js/Manager/ClipboardManager';
    import InputField from "@vue/Components/Form/InputField.vue";


    export default {
        components: {InputField, HelpText, SliderField, SelectField, Translate},
        data() {
            return {
                autoclose             : false,
                autosubmit            : false,
                autofill              : false,
                basicAuth             : false,
                compromised           : false,
                notifyPwNew           : false,
                relatedSearch         : false,
                notifyPwUpdate        : false,
                notificationQuickSave : false,
                recSearchMode         : 'host',
                recSearchRows         : 8,
                clearClipboard        : false,
                clearClipboardDelay   : 60,
                showUserInList        : false,
                miningIgnoredDomains  : '',
                miningIncognitoHide   : true,
                autofillIgnoredDomains: ''
            };
        },

        created() {
            this.loadData();
        },

        computed: {
            recommendationOptions() {
                return [
                    {
                        id   : 'domain',
                        label: 'LabelSearchRecommendationDomain'
                    },
                    {
                        id   : 'host',
                        label: 'LabelSearchRecommendationHost'
                    },
                    {
                        id   : 'exact',
                        label: 'LabelSearchRecommendationExact'
                    }
                ];
            },
            recommendationMaxRows() {
                let options = [];
                for(let i = 1; i <= 20; i++) {
                    if(i % 5 === 0 || i % 2 === 0 || i === 1) {
                        options.push({id: i, label: ['SearchRecommendationMaxRowsNumber', i]});
                    }
                }
                return options;
            },
            clearClipboardDelayOptions() {
                let options = [];
                for(let i of [15, 30, 45, 60, 90, 120]) {
                    options.push({id: i, label: ['SettingsClipboardClearDelayOptions', i]});
                }
                return options;
            }
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
                this.getSetting('notification.password.quicksave', 'notificationQuickSave');
                this.getSetting('search.recommendation.mode', 'recSearchMode');
                this.getSetting('search.recommendation.maxRows', 'recSearchRows');
                this.getSetting('clipboard.clear.passwords', 'clearClipboard');
                this.getSetting('clipboard.clear.delay', 'clearClipboardDelay');
                this.getSetting('password.list.show.user', 'showUserInList');
                this.getSetting('mining.ignored-domains', 'miningIgnoredDomains');
                this.getSetting('mining.incognito.hide', 'miningIncognitoHide');
                this.getSetting('autofill.ignored-domains', 'autofillIgnoredDomains');
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
            },
            requestClipboardReadPermission(oldValue) {
                if(oldValue !== true) ClipboardManager.requestReadPermission();
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
            clearClipboard(value, oldValue) {
                if(oldValue !== null && value !== oldValue) {
                    this.setSetting('clipboard.clear.passwords', value);
                }
            },
            clearClipboardDelay(value, oldValue) {
                if(oldValue !== null && value !== oldValue) {
                    this.setSetting('clipboard.clear.delay', value);
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
            },
            notificationQuickSave(value, oldValue) {
                if(oldValue !== null && value !== oldValue) {
                    this.setSetting('notification.password.quicksave', value);
                }
            },
            recSearchMode(value, oldValue) {
                if(oldValue !== null && value !== oldValue) {
                    this.setSetting('search.recommendation.mode', value);
                }
            },
            recSearchRows(value, oldValue) {
                if(oldValue !== null && value !== oldValue) {
                    this.setSetting('search.recommendation.maxRows', value);
                }
            },
            showUserInList(value, oldValue) {
                if(oldValue !== null && value !== oldValue) {
                    this.setSetting('password.list.show.user', value);
                }
            },
            miningIgnoredDomains(value, oldValue) {
                if(oldValue !== null && value !== oldValue) {
                    this.setSetting('mining.ignored-domains', value);
                }
            },
            miningIncognitoHide(value, oldValue) {
                if(oldValue !== null && value !== oldValue) {
                    this.setSetting('mining.incognito.hide', value);
                }
            },
            autofillIgnoredDomains(value, oldValue) {
                if(oldValue !== null && value !== oldValue) {
                    this.setSetting('autofill.ignored-domains', value);
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

    p {
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

        &.setting-textarea {
            flex-direction : column;
            align-items    : start;
        }
    }
}
</style>