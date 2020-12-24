<template>
    <div class="debug-settings">
        <translate tag="h3" say="DebugInternalStats"/>
        <div class="debug-info">
            <translate class="label" say="DebugInfoExtensionVersion"/>
            <span class="value">{{ app.version }}</span>
        </div>
        <div class="debug-info">
            <translate class="label" say="DebugInfoExtensionPlatform"/>
            <span class="value">{{ app.platform | capitalize }}</span>
        </div>
        <div class="debug-info">
            <translate class="label" say="DebugInfoExtensionEnvironment"/>
            <span class="value">{{ app.environment | capitalize }}</span>
        </div>
        <div class="debug-info">
            <translate class="label" say="DebugInfoHiddenFolderId"/>
            <span class="value">{{ hidden.id }}</span>
        </div>

        <translate tag="h3" say="DebugSettings"/>
        <div class="setting">
            <slider-field v-model="settings.localize"/>
            <translate tag="label" class="label" say="DebugLanguageTagsEnabled"/>
        </div>

        <translate tag="h3" say="DebugErrorLog"/>
        <div class="debug-error-item" v-for="error in errors">
            <div class="error-message" v-if="error.details && error.details.message" @click="showData">
                {{ getTitle(error) }}
                <icon font="regular" icon="clipboard" @click.stop="copy(error)"/>
            </div>
            <pre class="error-data">{{ error }}</pre>
        </div>
        <translate class="debug-no-errors" say="DebugNoErrors" v-if="errors.length === 0"/>
    </div>
</template>

<script>
    import MessageService from "@js/Services/MessageService";
    import Translate from "@vue/Components/Translate";
    import Icon from "@vue/Components/Icon";
    import ToastService from "@js/Services/ToastService";
    import ErrorManager from "@js/Manager/ErrorManager";
    import LocalisationService from "@js/Services/LocalisationService";
    import SliderField from "@vue/Components/Form/SliderField";
    import SettingsService from "@js/Services/SettingsService";

    export default {
        components: {SliderField, Icon, Translate},
        data() {
            return {
                hidden  : {
                    id: ''
                },
                errors  : [],
                app     : {
                    version    : process.env.APP_VERSION,
                    platform   : process.env.APP_PLATFORM,
                    environment: process.env.NODE_ENV
                },
                settings: {
                    localize: false
                },
                interval: null
            };
        },

        mounted() {
            this.loadData();
            if(!this.interval) {
                this.interval = setInterval(() => {
                    this.loadErrors();
                }, 3000);
            }
        },

        beforeDestroy() {
            clearInterval(this.interval);
            this.interval = null;
        },

        activated() {
            this.loadData();
            if(!this.interval) {
                this.interval = setInterval(() => {
                    this.loadErrors();
                }, 3000);
            }
        },

        deactivated() {
            clearInterval(this.interval);
            this.interval = null;
        },

        methods: {
            loadData() {
                MessageService.send('options.debug.data').then((reply) => {
                    let data = reply.getPayload();

                    if(data.hasOwnProperty('hidden')) {
                        this.hidden = data.hidden;
                    }

                    if(data.hasOwnProperty('settings')) {
                        this.settings = data.settings;
                    }
                });
                this.loadErrors();
            },
            loadErrors() {
                MessageService.send('options.debug.errors').then((reply) => {
                    this.errors = reply.getPayload();
                });
            },
            getTitle(error) {
                if(error.details) {
                    let label = '';
                    if(error.details.time) {
                        let date    = new Date(error.details.time),
                            month   = (date.getMonth() + 1).toString().padStart(2, '0'),
                            day     = date.getDate().toString().padStart(2, '0'),
                            hours   = (date.getHours() + 1).toString().padStart(2, '0'),
                            minutes = date.getMinutes().toString().padStart(2, '0'),
                            seconds = date.getSeconds().toString().padStart(2, '0');

                        label = `[${date.getFullYear()}-${month}-${day} ${hours}:${minutes}:${seconds}] `;
                    }

                    if(error.details.message) {
                        label += error.details.message;
                    } else {
                        label += LocalisationService.translate('DebugErrorNoMessage');
                    }
                    return label;
                }

                return LocalisationService.translate('DebugErrorNoDetails');
            },
            showData($event) {
                $event.target.parentNode.classList.toggle('open');
            },
            copy(error) {
                navigator.clipboard.writeText(JSON.stringify(error));

                ToastService
                    .success('DebugErrorDataCopied')
                    .catch(ErrorManager.catchEvt);
            }
        },

        watch: {
            'settings.localize': (value) => {
                SettingsService
                    .set('debug.localisation.enabled', !value)
                    .catch(ErrorManager.catchEvt);
            }
        }
    };
</script>

<style lang="scss">
.tab-container .tab.tab-label-debug {
    flex-grow : 0;
}

.debug-settings {
    .debug-info {
        padding : .25rem 1rem;
        display : flex;

        .label {
            flex-grow : 1;
        }

        .value {
            user-select : text;
            cursor      : text;
        }
    }

    .debug-error-item {
        .error-message {
            overflow         : hidden;
            background-color : var(--element-bg-color);
            color            : var(--element-fg-color);
            box-shadow       : var(--tab-border);
            transition       : var(--element-transition);
            padding          : 1rem;
            white-space      : nowrap;
            text-overflow    : ellipsis;
            cursor           : pointer;

            &:hover {
                background-color : var(--element-hover-bg-color);
                color            : var(--element-hover-fg-color);
                box-shadow       : var(--tab-border);
            }

            .icon {
                float            : right;
                width            : 3rem;
                line-height      : 3rem;
                text-align       : center;
                margin           : -1rem;
                background-color : var(--button-bg-color);
                color            : var(--button-fg-color);
                transition       : var(--button-transition);

                &:hover {
                    background-color : var(--button-hover-bg-color);
                    color            : var(--button-hover-fg-color);
                    box-shadow       : var(--tab-button-active-border);
                }
            }
        }

        .error-data {
            width       : 100vw;
            overflow    : auto;
            padding     : .25rem 1rem;
            margin      : 0;
            display     : none;
            user-select : text;
            cursor      : text;
        }

        &.open .error-data {
            display : block;
        }
    }

    .debug-no-errors {
        text-align : center;
        padding    : 1rem;
        display    : block;
    }
}
</style>