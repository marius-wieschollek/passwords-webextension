<template>
    <div class="theming" v-if="theme">
        <div class="theme-settings">
            <div class="setting">
                <translate tag="label" for="theme-current" say="SettingsThemeId"/>
                <select-field id="theme-current" :options="list" v-model="themeId"/>
            </div>
            <custom-theme :theme="theme" v-if="theme.getType() === 'custom'"/>
        </div>
        <preview-theme :theme="theme"/>
        <theme-options :theme="theme" v-on:update="reloadThemes"/>
    </div>
</template>

<script>
    import SelectField from '@vue/Components/Form/SelectField';
    import MessageService from '@js/Services/MessageService';
    import Translate from '@vue/Components/Translate';
    import ToastService from '@js/Services/ToastService';
    import PreviewTheme from '@vue/Components/Theming/PreviewTheme';
    import CustomTheme from '@vue/Components/Theming/CustomTheme';
    import ErrorManager from '@js/Manager/ErrorManager';
    import ThemeOptions from "@vue/Components/Theming/ThemeOptions.vue";

    export default {
        components: {ThemeOptions, CustomTheme, PreviewTheme, Translate, SelectField},

        data() {
            return {
                themeId: null,
                theme  : null,
                themes : []
            };
        },

        computed: {
            list() {
                let list = {};

                for(let theme of this.themes) list[theme.getId()] = theme.getLabel();

                return list;
            }
        },

        async mounted() {
            await this.reloadThemes();
        },

        methods: {
            setCurrentTheme(themeId) {
                for(let theme of this.themes) {
                    if(theme.getId() === themeId) {
                        this.theme = theme;
                        return;
                    }
                }

                this.theme = this.themes[0];
            },
            async reloadThemes() {
                let reply = await MessageService.send('theme.list');
                this.themes = reply.getPayload();
                console.log(this.themes);

                reply = await MessageService.send({type: 'setting.get', payload: 'theme.current'});
                this.themeId = reply.getPayload().value;

                this.setCurrentTheme(this.themeId);
            }
        },

        watch: {
            themeId(value) {
                MessageService
                    .send({type: 'setting.set', payload: {setting: 'theme.current', value}})
                    .catch((e) => { ToastService.error(e.message); });

                this.setCurrentTheme(this.themeId);
                MessageService.send(
                    {
                        type    : 'theme.preview',
                        payload : this.theme,
                        receiver: 'popup'
                    }
                ).catch(ErrorManager.catch);
            }
        }
    };
</script>

<style lang="scss">
.theming {
    display               : grid;
    grid-template-columns : 3fr 4fr;
    grid-template-areas   : "settings preview"  "settings options";
    grid-template-rows    : min-content 1fr;
    grid-column-gap       : 1rem;
    grid-row-gap          : 1rem;
    padding               : 1rem;

    .theme-settings {
        grid-area : settings;

        .setting {
            display               : grid;
            grid-template-areas   : "label input";
            grid-template-columns : 3fr 2fr;
            margin-bottom         : .25rem;

            label {
                grid-area : label;
            }

            select,
            input {
                grid-area : input;
                width     : 100%;
            }
        }
    }

    .theme-colors {
        .color-setting {
            display               : grid;
            grid-template-columns : 1fr 1.5rem 1.5rem;
            grid-column-gap       : .2rem;
            margin-bottom         : .2rem;

            input {
                padding    : 0;
                margin     : 0;
                border     : 0;
                outline    : 0;
                box-shadow : 0 0 0 1px var(--element-hover-bg-color);
                width      : 1.5rem;
                cursor     : pointer;

                &[disabled] {
                    opacity : .25;
                }
            }
        }
    }

    .theme-preview {
        grid-area : preview;
    }

    .theme-options {
        grid-area : options;
    }
}

body.edge,
body.mobile {
    .theming {
        grid-template-columns : 1fr;
        grid-row-gap          : 1rem;
        grid-column-gap       : 0;
        padding               : 0;

        .theme-settings {
            padding : 1rem;
        }
    }
}
</style>