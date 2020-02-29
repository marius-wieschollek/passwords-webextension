<template>
    <div>
        <translate tag="h4" say="SettingsCustomTheme"/>
        <div class="theme-colors">
            <translate tag="h4" say="CustomDefaultElement" />
            <custom-color-set name="element" type="bg" :colors="themeColors" v-on:update="update" />
            <custom-color-set name="element" type="fg" :colors="themeColors" v-on:update="update" />
            <translate tag="h4" say="CustomActiveElement" />
            <custom-color-set name="element-active" type="bg" :colors="themeColors" v-on:update="update" />
            <custom-color-set name="element-active" type="fg" :colors="themeColors" v-on:update="update" />
            <translate tag="h4" say="CustomButtons" />
            <custom-color-alpha name="button" type="bg" :colors="themeColors" v-on:update="update" />
            <custom-color-set name="button" type="bg" :colors="themeColors" v-on:update="update" />
            <custom-color-alpha name="button" type="fg" :colors="themeColors" v-on:update="update" />
            <custom-color-set name="button" type="fg" :colors="themeColors" v-on:update="update"/>
        </div>
    </div>
</template>

<script>
    import LightTheme from '@js/Themes/Light';
    import Translate from '@vue/Components/Translate';
    import CustomColorSet from '@vue/Components/Theming/CustomColorSet';
    import CustomColorAlpha from '@vue/Components/Theming/CustomColorAlpha';

    export default {
        components: {CustomColorAlpha, CustomColorSet, Translate},
        data() {
            return {
                themeColors: LightTheme.colors
            }
        },
        methods: {
            update(colors) {
                this.themeColors = Object.assign(this.themeColors, colors);
            }
        }
    };
</script>
