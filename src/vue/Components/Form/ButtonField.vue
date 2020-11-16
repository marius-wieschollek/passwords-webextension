<template>
    <button :type="getType" :title="getTitle" v-on="$listeners">{{getValue}}</button>
</template>

<script>
    import LocalisationService from '@js/Services/LocalisationService';

    export default {

        props: {
            value      : {
                type   : String,
                default: ''
            },
            title      : {
                type   : String,
                default: ''
            },
            type       : {
                type   : String,
                default: 'button'
            }
        },

        computed: {
            getTitle() {
                if(this.title.length === 0) return;

                return LocalisationService.translate(this.title);
            },
            getValue() {
                if(this.value.length === 0) return;

                return LocalisationService.translate(this.value);
            },
            getType() {
                return this.type === 'submit' ? 'submit':'button';
            }
        }
    };
</script>