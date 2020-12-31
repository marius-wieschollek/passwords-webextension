<template>
    <div class="color-setting">
        <translate :say="label"/>
        <input-field type="color" v-model="currentBackground" :title="titleBg"/>
        <input-field type="color" v-model="currentForeground" :title="titleFg"/>
    </div>
</template>

<script>
    import Translate from '@vue/Components/Translate';
    import InputField from '@vue/Components/Form/InputField';

    export default {
        components: {InputField, Translate},

        props: {
            name   : String,
            label  : String,
            colors : Object,
            titleBg: {
                type   : String,
                default: 'ToastBackgroundTitle'
            },
            titleFg: {
                type   : String,
                default: 'ToastForegroundTitle'
            }
        },

        data() {
            let keyBackground = `${this.name}-bg`,
                keyForeground = `${this.name}-fg`;

            return {
                defaultBackground: this.colors[keyBackground],
                defaultForeground: this.colors[keyForeground],
                currentBackground: this.colors[keyBackground],
                currentForeground: this.colors[keyForeground],
                keyBackground,
                keyForeground
            };
        },

        methods: {
            update() {
                let colors = {};

                colors[this.keyBackground] = this.currentBackground;
                colors[this.keyForeground] = this.currentForeground;

                this.$emit('update', colors);
            }
        },

        watch: {
            colors: {
                deep: true,
                handler(value) {
                    this.defaultBackground = value[this.keyBackground];
                    this.defaultForeground = value[this.keyForeground];
                    this.currentBackground = value[this.keyBackground];
                    this.currentForeground = value[this.keyForeground];
                }
            },
            currentBackground() {
                this.update();
            },
            currentForeground() {
                this.update();
            }
        }
    };
</script>

<style lang="scss">

</style>