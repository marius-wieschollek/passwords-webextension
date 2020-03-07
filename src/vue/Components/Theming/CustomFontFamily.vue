<template>
    <div class="setting">
        <translate tag="label" for="custom-font" say="SettingsCustomFont"/>
        <select-field id="custom-font" :options="options" v-model="model"/>
    </div>
</template>

<script>
    import SelectField from '@vue/Components/Form/SelectField';
    import Translate from '@vue/Components/Translate';

    export default {
        components: {Translate, SelectField},

        props: ['value'],

        data() {
            return {
                model: this.value
            };
        },

        computed: {
            options() {
                let options = {
                    default  : 'FontDefault',
                    mono     : 'FontMono',
                    serif    : 'FontSerif',
                    sans     : 'FontSans',
                    light    : 'FontLight',
                    nextcloud: 'FontNextcloud',
                    dyslexic : 'FontOpenDyslexic'
                };

                if(!options.hasOwnProperty(this.value)) {
                    options[this.value] = 'FontCustom';
                }

                return options;
            }
        },

        watch: {
            value(value) {
                this.model = value;
            },
            model(value) {
                if(this.value !== value) this.$emit('input', value);
            }
        }
    };
</script>