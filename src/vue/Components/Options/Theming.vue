<template>
    <div class="theming">
        <div class="theme-settings">
            <div class="setting">
                <translate tag="label" for="theme-current" say="SettingsCurrentTheme"/>
                <select-field id="theme-current" :options="themeList" :translate="false" v-model="currentTheme"/>
            </div>
            <translate tag="h4" say="SettingsCustomColors"/>
            <div class="custom-colors">

            </div>
        </div>
        <preview-theme :theme="currentTheme"/>
    </div>
</template>

<script>
    import SelectField from '@vue/Components/Form/SelectField';
    import MessageService from '@js/Services/MessageService';
    import Translate from '@vue/Components/Translate';
    import ToastService from '@js/Services/ToastService';
    import PreviewTheme from '@vue/Components/Theming/PreviewTheme';

    export default {
        components: {PreviewTheme, Translate, SelectField},

        data() {
            return {
                currentTheme: null,
                themeList   : {}
            };
        },

        mounted() {
            MessageService.send({type: 'theme.list'}).then((r) => { this.themeList = r.getPayload(); });
            MessageService.send({type: 'setting.get', payload: 'theme.current'}).then((r) => {
                this.currentTheme =
                    r.getPayload();
            });
        },

        watch: {
            currentTheme(value) {
                MessageService.send({type: 'setting.set', payload: {setting: 'theme.current', value}})
                    .catch((e) => { ToastService.error(e.message); });
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

        .theme-preview {
            background-color : grey;
        }

        .theme-settings {
            .setting {
                display               : grid;
                grid-template-areas   : "label" "input";
                grid-template-columns : 1fr 1fr;

                label {
                    grid-area : label;
                }

                span,
                input {
                    grid-area : input;
                }
            }
        }
    }
</style>