<template>
    <input :placeholder="getPlaceholder" :title="getTitle" v-model="model" />
</template>

<script>
    import LocalisationService from '@js/Services/LocalisationService';

    export default {

        props: {
            value      : {
                type   : String,
                default: ''
            },
            placeholder: {
                type   : String,
                default: ''
            },
            title      : {
                type   : String,
                default: ''
            }
        },

        data() {
            return {
                model: this.value
            };
        },

        computed: {
            getPlaceholder() {
                if(this.placeholder.length === 0) return;

                return LocalisationService.translate(this.placeholder);
            },
            getTitle() {
                if(this.title.length === 0) return;

                return LocalisationService.translate(this.title);
            }
        },

        watch: {
            model(value) {
                this.$emit('input', value);
            }
        }
    };
</script>