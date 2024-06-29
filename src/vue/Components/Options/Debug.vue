<template>
    <div class="debug-settings">
        <translate tag="h3" say="DebugInternalStats"/>
        <div class="debug-info">
            <translate class="label" say="DebugInfoExtensionVersion"/>
            <span class="value">{{ app.version }}</span>
        </div>
        <div class="debug-info">
            <translate class="label" say="DebugInfoExtensionBuild"/>
            <span class="value">{{ app.platform | capitalize }}</span>
        </div>
        <div class="debug-info">
            <translate class="label" say="DebugInfoExtensionEnvironment"/>
            <span class="value">{{ app.environment | capitalize }}</span>
        </div>
        <div class="debug-info">
            <translate class="label" say="DebugInfoExtensionPlatform"/>
            <span class="value">{{ userAgent }}</span>
        </div>

        <translate tag="h3" say="DebugInfoHiddenFolderId"/>
        <div class="debug-info" v-for="server in hidden" :key="server.id">
            <span class="label">{{ server.label }}</span>
            <a :href="server.link" target="_blank" class="link">{{ server.id }}</a>
        </div>
        <div class="debug-info" v-if="hidden.length === 0">
            <span class="value">-</span>
        </div>

        <translate tag="h3" say="DebugResetTitle"/>
        <div class="debug-info">
            <button-field title="DebugResetStatisticsTitle" value="DebugResetStatistics" @click="resetStatistics"/>
        </div>
        <div class="debug-info">
            <button-field title="DebugResetExtensionTitle" value="DebugResetExtension" @click="resetExtension"/>
        </div>

        <translate tag="h3" say="DebugSettings"/>
        <div class="setting">
            <slider-field v-model="settings.localize"/>
            <translate tag="label" class="label" say="DebugLanguageTagsEnabled"/>
        </div>

        <translate tag="h3" say="DebugBuild"/>
        <translate class="debug-source-and-build" say="DebugSourceAndBuild" tag="a" href="./build.html" target="_blank"/>

        <translate tag="h3" say="DebugErrorLog">
            <div class="debug-log-actions">
                <icon font="regular" icon="clipboard" @click.stop="copy(errors)" v-if="errors.length !== 0"/>
                <icon icon="trash-alt" font="regular" @click="clearLog" v-if="errors.length !== 0"/>
            </div>
        </translate>
        <div class="debug-error-item" v-for="error in errors">
            <div class="error-message" @click="showData">
                <span class="title">{{ getTitle(error) }}</span>
                <icon font="regular" icon="clipboard" @click.stop="copy(error)"/>
            </div>
            <pre class="error-data">{{ error }}</pre>
        </div>
        <translate class="debug-no-errors" say="DebugNoErrors" v-if="errors.length === 0"/>
    </div>
</template>

<script>
    import MessageService from '@js/Services/MessageService';
    import Translate from '@vue/Components/Translate';
    import Icon from '@vue/Components/Icon';
    import ToastService from '@js/Services/ToastService';
    import ErrorManager from '@js/Manager/ErrorManager';
    import LocalisationService from '@js/Services/LocalisationService';
    import SliderField from '@vue/Components/Form/SliderField';
    import SettingsService from '@js/Services/SettingsService';
    import ButtonField from "@vue/Components/Form/ButtonField.vue";
    import ClipboardService from "@js/Services/ClipboardService";

    export default {
        components: {ButtonField, SliderField, Icon, Translate},
        data() {
            return {
                hidden  : [],
                errors  : [],
                app     : {
                    version    : process.env.APP_VERSION,
                    platform   : process.env.APP_PLATFORM,
                    environment: process.env.NODE_ENV
                },
                settings: {
                    localize: false
                },
                platform: {
                    device : '',
                    os     : '',
                    arch   : '',
                    name   : '',
                    vendor : '',
                    version: ''
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

        computed: {
            userAgent() {
                return `${this.platform.vendor} ${this.platform.name} ${this.platform.version} / ${this.platform.device.capitalize()} ${this.platform.os.capitalize()} ${this.platform.arch}`;
            }
        },

        methods: {
            loadData() {
                MessageService.send('options.debug.info').then((reply) => {
                    let data = reply.getPayload();

                    if(data.hasOwnProperty('hidden')) {
                        this.hidden = data.hidden;
                    }

                    if(data.hasOwnProperty('settings')) {
                        this.settings = data.settings;
                    }

                    if(data.hasOwnProperty('app')) {
                        this.app = data.app;
                    }

                    if(data.hasOwnProperty('platform')) {
                        this.platform = data.platform;
                    }
                });
                this.loadErrors();
            },
            loadErrors() {
                MessageService.send('options.debug.log.fetch').then((reply) => {
                    this.errors = reply.getPayload();
                });
            },
            clearLog() {
                MessageService.send('options.debug.log.clear').then((reply) => {
                    this.errors = [];
                });
            },
            resetStatistics() {
                MessageService.send('options.debug.reset.statistics')
                              .catch(ErrorManager.catch);
                setTimeout(() => {location.reload();}, 1000);
            },
            resetExtension() {
                MessageService.send('options.debug.reset.extension')
                              .catch(ErrorManager.catch);
                setTimeout(() => {location.reload();}, 1000);
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
                    } else if(error.error && error.error.message) {
                        label += error.error.message;
                    } else {
                        label += LocalisationService.translate('DebugErrorNoMessage');
                    }
                    return label;
                }

                return LocalisationService.translate('DebugErrorNoDetails');
            },
            showData($event) {
                $event.currentTarget.parentNode.classList.toggle('open');
            },
            copy(error) {
                ClipboardService.writeText(JSON.stringify(error));

                ToastService
                    .success('DebugErrorDataCopied')
                    .catch(ErrorManager.catch);
            }
        },

        watch: {
            'settings.localize': (value) => {
                SettingsService
                    .set('debug.localisation.enabled', !value)
                    .catch(ErrorManager.catch);
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
            text-align  : right;
        }

        .link {
            cursor          : pointer;
            text-align      : right;
            color           : var(--element-active-fg-color);
            text-decoration : none;

            &:hover,
            &:active {
                color           : var(--element-active-hover-fg-color);
                text-decoration : underline;
            }
        }
    }

    .debug-source-and-build {
        padding         : .25rem 1rem;
        color           : var(--element-active-fg-color);
        text-decoration : none;

        &:hover,
        &:active {
            color           : var(--element-active-hover-fg-color);
            text-decoration : underline;
        }
    }

    .debug-log-actions {
        float        : right;
        margin-top   : -1.5rem;
        margin-right : -1rem;

        .icon {
            cursor           : pointer;
            padding          : 1rem;
            display          : inline-block;
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

    .debug-error-item {
        .error-message {
            background-color : var(--element-bg-color);
            color            : var(--element-fg-color);
            box-shadow       : var(--tab-border);
            transition       : var(--element-transition);
            padding          : 1rem;
            white-space      : nowrap;
            cursor           : pointer;
            display          : flex;

            &:hover {
                background-color : var(--element-hover-bg-color);
                color            : var(--element-hover-fg-color);
                box-shadow       : var(--tab-border);
            }

            .title {
                overflow      : hidden;
                flex-grow     : 1;
                text-overflow : ellipsis;
                padding-right : 0.25rem;
            }

            .icon {
                width            : 3rem;
                line-height      : 3rem;
                text-align       : center;
                margin           : -1rem;
                flex-grow        : 0;
                flex-shrink      : 0;
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