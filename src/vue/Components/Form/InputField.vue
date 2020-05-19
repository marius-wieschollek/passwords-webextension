<template>
    <input :type="type"
           :value="value"
           :checked="isChecked"
           :placeholder="getPlaceholder"
           :title="getTitle"
           v-on="listeners"
           @input="handleInput"
           @change="handleChange"/>
</template>

<script>
    import LocalisationService from '@js/Services/LocalisationService';

    export default {

        props: {
            type       : {
                type   : String,
                default: 'text'
            },
            value      : {
                type   : [String, Number, Boolean],
                default: null
            },
            checked    : {
                type   : Boolean,
                default: null
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

        computed: {
            getPlaceholder() {
                if(this.placeholder.length === 0) return;

                return LocalisationService.translate(this.placeholder);
            },
            getTitle() {
                if(this.title.length === 0) return;

                return LocalisationService.translate(this.title);
            },
            isChecked() {
                if(this.type !== 'checkbox' && this.type !== 'radio') return undefined;

                return this.checked || this.value;
            }
        },

        methods: {
            listeners() {
                let listeners = {};

                for(let key in this.$listeners) {
                    if(this.$listeners.hasOwnProperty(key) && key !== 'input' && key !== 'change') {
                        listeners[key] = this.$listeners[key];
                    }
                }
                console.log(listeners);

                return listeners;
            },
            handleInput($event) {
                if(this.type !== 'checkbox' && this.type !== 'radio') {
                    this.$emit('input', $event.target.value);
                }
            },
            handleChange($event) {
                if(this.type === 'checkbox' || this.type === 'radio') {
                    this.$emit('change', $event.target.checked);
                    this.$emit('input', $event.target.checked);
                }
            }
        }
    };
</script>