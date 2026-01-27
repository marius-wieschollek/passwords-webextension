<template>
    <div class="settings-general" v-if="initialized">
        <translate tag="h3" say="AutofillSettings"/>
        <div class="setting">
            <slider-field id="paste-autoclose" v-model="settings['paste.popup.close']"/>
            <translate tag="label" for="paste-autoclose" say="SettingsPastePopupClose"/>
        </div>
        <div class="setting">
            <slider-field id="paste-autosubmit" v-model="settings['paste.form.submit']"/>
            <translate tag="label" for="paste-autosubmit" say="SettingsPasteFormSubmit"/>
        </div>
        <div class="setting">
            <slider-field id="paste-compromised" v-model="settings['paste.compromised.warning']"/>
            <translate tag="label" for="paste-compromised" say="SettingsPasteWarnCompromised"/>
        </div>
        <div class="setting">
            <slider-field id="paste-autofill" v-model="settings['paste.autofill']"/>
            <translate tag="label" for="paste-autofill" say="SettingsPasteAutofillEnabled"/>
            <help-text type="warning" text="HelpPasteAutofill"/>
        </div>
        <div class="setting">
            <slider-field id="paste-autofill-whitelist" v-model="settings['paste.autofill.whitelist']"/>
            <translate tag="label" for="paste-autofill-whitelist" say="SettingsPasteAutofillWhitelist"/>
            <help-text type="info" text="HelpPasteAutofillWhitelist"/>
        </div>
        <div class="setting v3">
            <slider-field id="paste-basic-auth" v-model="settings['paste.basic-auth']"/>
            <translate tag="label" for="paste-basic-auth" say="SettingsPasteBasicAuth"/>
            <help-text type="warning" text="HelpPasteBasicAuth"/>
        </div>
        <div class="setting v3">
            <slider-field id="clipboard-clear-passwords" v-model="settings['clipboard.clear.passwords']" :readonly="true"/>
            <translate tag="label" for="clipboard-clear-passwords" say="SettingsClearClipboardPasswords"/>
            <help-text type="info" text="HelpClearClipboardPasswords"/>
        </div>
        <div class="setting v3">
            <translate tag="label" for="clipboard-clear-delay" say="SettingsClearClipboardDelay" :readonly="true"/>
            <select-field id="clipboard-clear-delay" :options="clearClipboardDelayOptions" v-model="settings['clipboard.clear.delay']" :disabled="!settings['clipboard.clear.passwords']"/>
        </div>
        <div class="setting setting-textarea">
            <translate tag="label" for="mining-autofill-domains" say="SettingsAutofillIgnoredDomains"/>
            <input-field type="textarea" id="mining-autofill-domains" v-model="settings['autofill.ignored-domains']" placeholder="SettingsAutofillIgnoredDomainsPlaceholder"/>
        </div>

        <translate tag="h3" say="RecommendationSettings"/>
        <div class="setting">
            <translate tag="label" for="search-recommendation-option" say="SettingsSearchRecommendationOption"/>
            <select-field id="search-recommendation-option" :options="recommendationOptions" v-model="settings['search.recommendation.mode']"/>
        </div>
        <div class="setting">
            <translate tag="label" for="search-recommendation-maxRows" say="SettingsSearchRecommendationMaxRows"/>
            <select-field id="search-recommendation-maxRows" :options="recommendationMaxRows" v-model="settings['search.recommendation.maxRows']"/>
        </div>

        <translate tag="h3" say="UiSettings"/>
        <div class="setting">
            <slider-field id="show-username-in-list" v-model="settings['password.list.show.user']"/>
            <translate tag="label" for="show-username-in-list" say="SettingsShowUsernameInList"/>
        </div>

        <translate tag="h3" say="SearchSettings"/>
        <div class="setting">
            <slider-field id="popup-related-search" v-model="settings['popup.related.search']"/>
            <translate tag="label" for="popup-related-search" say="SettingsPopupRelatedSearch"/>
        </div>

        <translate tag="h3" say="PasswordMiningSettings"/>
        <div class="setting">
            <slider-field id="mining-enabled" v-model="settings['mining.enabled']"/>
            <translate tag="label" for="mining-enabled" say="SettingsMiningEnabled"/>
        </div>
        <div class="setting">
            <slider-field id="notification-password-new" v-model="settings['notification.password.new']"/>
            <translate tag="label" for="notification-password-new" say="SettingsNotifyPasswordNew"/>
        </div>
        <div class="setting">
            <slider-field id="notification-password-update" v-model="settings['notification.password.update']"/>
            <translate tag="label" for="notification-password-update" say="SettingsNotifyPasswordUpdate"/>
        </div>
        <div class="setting">
            <slider-field id="notification-password-quicksave" v-model="settings['notification.password.quicksave']"/>
            <translate tag="label" for="notification-password-quicksave" say="SettingsNotifyPasswordQuicksave"/>
        </div>
        <div class="setting">
            <slider-field id="mining-incognito-hide" v-model="settings['mining.incognito.hide']"/>
            <translate tag="label" for="mining-incognito-hide" say="SettingsMiningIncognitoHide"/>
        </div>
        <div class="setting setting-textarea">
            <translate tag="label" for="mining-ignored-domains" say="SettingsMiningIgnoredDomains"/>
            <input-field type="textarea" id="mining-ignored-domains" v-model="settings['mining.ignored-domains']" placeholder="SettingsMiningIgnoredDomainsPlaceholder"/>
        </div>

        <translate tag="h3" say="ContextMenu"/>
        <div class="setting">
            <slider-field id="context-menu-item-visibility" v-model="settings['contextmenu.enabled']"/>
            <translate tag="label" for="context-menu-item-visibility" say="contextMenuEnabled"/>
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
    import InputField from "@vue/Components/Form/InputField.vue";

    const SETTINGS_LIST = [
        'paste.popup.close',
        'paste.form.submit',
        'paste.compromised.warning',
        'paste.autofill',
        'paste.autofill.whitelisted',
        'paste.basic-auth',
        'popup.related.search',
        'notification.password.new',
        'notification.password.update',
        'notification.password.quicksave',
        'search.recommendation.mode',
        'search.recommendation.maxRows',
        'clipboard.clear.passwords',
        'clipboard.clear.delay',
        'password.list.show.user',
        'mining.enabled',
        'mining.ignored-domains',
        'mining.incognito.hide',
        'autofill.ignored-domains',
        'contextmenu.enabled'
    ];

    let settingValues = {};

    export default {
        components: {InputField, HelpText, SliderField, SelectField, Translate},
        data() {
            let data = {initialized: false, settings: {}};

            for(let key of SETTINGS_LIST) {
                data.settings[key] = null;
            }

            return data;
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
                let promises = [];
                for(let key of SETTINGS_LIST) {
                    promises.push(this.getSetting(key));
                }

                Promise.all(promises).then(() => {
                    this.initialized = true;
                });
            },
            async getSetting(name) {
                try {
                    let value = await SettingsService.getValue(name);
                    settingValues[name] = value;
                    this.settings[name] = value;
                } catch(e) {
                    ErrorManager.logError(e);
                    ToastService.error(e.message).catch(ErrorManager.catch);
                }
            },
            async setSetting(name, value) {
                try {
                    if(this.initialized && settingValues[name] !== value) {
                        await SettingsService.set(name, value);
                        settingValues[name] = value;
                    }
                } catch(e) {
                    ErrorManager.logError(e);
                    ToastService.error(e.message).catch(ErrorManager.catch);
                }
            }
        },

        watch: {
            settings: {
                deep   : true,
                handler: function(value) {
                    for(let name of SETTINGS_LIST) {
                        this.setSetting(name, value[name]);
                    }
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

        &.v3 {
            position : relative;

            &:after {
                position         : absolute;
                top              : 0;
                left             : 0;
                right            : 0;
                bottom           : 0;
                content          : "Only available in Firefox due to Manifest V3";
                background-color : rgba(255, 255, 255, 0.25);
                backdrop-filter  : blur(2px);
                text-align       : center;
                line-height      : 3rem;
                color            : var(--element-active-fg-color);
                font-weight      : bold;
            }
        }
    }
}
</style>