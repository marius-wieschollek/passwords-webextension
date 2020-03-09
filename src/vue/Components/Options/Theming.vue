<template>
    <div class="theming" v-if="theme">
        <div class="theme-settings">
            <div class="setting">
                <translate tag="label" for="theme-current" say="SettingsThemeId"/>
                <select-field id="theme-current" :options="list" v-model="themeId"/>
            </div>
            <custom-theme :theme="customTheme" v-if="customTheme && themeId === 'custom'"/>
        </div>
        <preview-theme :theme="theme"/>
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

    export default {
        components: {CustomTheme, PreviewTheme, Translate, SelectField},

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
            },
            customTheme() {
                for(let theme of this.themes) {
                    if(theme.getId() === 'custom') return theme;
                }
            }
        },

        async mounted() {
            let reply = await MessageService.send({type: 'theme.list'});
            this.themes = reply.getPayload();

            reply = await MessageService.send({type: 'setting.get', payload: 'theme.current'});
            this.themeId = reply.getPayload();

            this.setCurrentTheme(this.themeId);
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
            }
        },

        watch: {
            themeId(value) {
                MessageService.send({type: 'setting.set', payload: {setting: 'theme.current', value}})
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
        grid-column-gap       : 1rem;
        padding               : 1rem;

        .theme-settings {
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
    }
</style>