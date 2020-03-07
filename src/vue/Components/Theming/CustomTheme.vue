<template>
    <div class="theme-colors">
        <translate tag="h4" say="CustomFont"/>
        <custom-font-family v-model="font.family"/>
        <custom-font-size v-model="font.size"/>
        <translate tag="h4" say="CustomDefaultElement"/>
        <custom-color-set name="element" type="bg" :colors="colors" v-on:update="update"/>
        <custom-color-set name="element" type="fg" :colors="colors" v-on:update="update"/>
        <translate tag="h4" say="CustomActiveElement"/>
        <custom-color-set name="element-active" type="bg" :colors="colors" v-on:update="update"/>
        <custom-color-set name="element-active" type="fg" :colors="colors" v-on:update="update"/>
        <translate tag="h4" say="CustomButtons"/>
        <custom-color-inherit name="button" type="bg" :colors="colors" v-on:update="update"/>
        <custom-color-set name="button" type="bg" :colors="colors" v-on:update="update"/>
        <custom-color-inherit name="button" type="fg" :colors="colors" v-on:update="update"/>
        <custom-color-set name="button" type="fg" :colors="colors" v-on:update="update"/>
        <translate tag="h4" say="CustomToasts"/>
        <custom-color-toast name="info" label="ToastInfoColors" :colors="colors" v-on:update="update"/>
        <custom-color-toast name="success" label="ToastSuccessColors" :colors="colors" v-on:update="update"/>
        <custom-color-toast name="warning" label="ToastWarningColors" :colors="colors" v-on:update="update"/>
        <custom-color-toast name="error" label="ToastErrorColors" :colors="colors" v-on:update="update"/>
        <translate tag="h4" say="CustomBadge"/>
        <badge-icon v-model="badge.icon"/>
        <custom-color-toast name="color"
                            label="CustomBadgeColors"
                            title-bg="BadgeBackgroundTitle"
                            title-fg="BadgeForegroundTitle"
                            :colors="badge"
                            v-on:update="updateBadge"/>
    </div>
</template>

<script>
    import Theme from '@js/Models/Theme/Theme';
    import Translate from '@vue/Components/Translate';
    import MessageService from '@js/Services/MessageService';
    import BadgeIcon from '@vue/Components/Theming/BadgeIcon';
    import CustomFontSize from '@vue/Components/Theming/CustomFontSize';
    import CustomColorSet from '@vue/Components/Theming/CustomColorSet';
    import CustomFontFamily from '@vue/Components/Theming/CustomFontFamily';
    import CustomColorToast from '@vue/Components/Theming/CustomColorToast';
    import CustomColorInherit from '@vue/Components/Theming/CustomColorInherit';
    import ToastService from '@js/Services/ToastService';
    import ErrorManager from '@js/Manager/ErrorManager';

    export default {
        components: {
            CustomFontFamily,
            CustomFontSize,
            BadgeIcon,
            CustomColorToast,
            CustomColorInherit,
            CustomColorSet,
            Translate
        },

        props: {
            theme: Theme
        },

        data() {
            return {
                font  : this.theme.getFont(),
                badge : this.theme.getBadge(),
                colors: this.theme.getColors()
            };
        },
        methods: {
            update(colors) {
                this.colors = Object.assign(this.colors, colors);
                this.theme.setColors(this.colors);
                this.updatePreview();
                this.saveTheme();
            },
            updateBadge(colors) {
                this.badge = Object.assign(this.badge, colors);
                this.theme.setBadge(this.badge);
                this.saveTheme();
            },
            updatePreview() {
                MessageService.send(
                    {
                        type    : 'theme.preview',
                        payload : this.theme,
                        receiver: 'popup'
                    }
                );
            },
            async saveTheme() {
                let reply = await MessageService.send({type: 'theme.save', payload: this.theme});
                if(!reply.getPayload().success) {
                    ToastService.error(['ThemeSaveError', reply.getPayload().message])
                        .catch(ErrorManager.catch);
                }
            }
        },
        watch  : {
            'font.family'(value) {
                this.theme.setFontFamily(value);
                this.updatePreview();
                this.saveTheme();
            },
            'font.size'(value) {
                this.theme.setFontSize(value);
                this.updatePreview();
                this.saveTheme();
            },
            'badge.icon'(value) {
                this.theme.setBadgeIcon(value);
                this.saveTheme();
            }
        }
    };
</script>
