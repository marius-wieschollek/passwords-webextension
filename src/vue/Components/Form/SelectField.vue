<template>
    <select @change="handleChange" v-on="listeners">
        <option v-for="option in optionList"
                :key="option.id"
                :value="option.id"
                :disabled="option.disabled"
                :selected="option.id === value"
                :title="getTranslated(option.description)">{{getTranslated(option.label)}}
        </option>
    </select>
</template>

<script>
    import LocalisationService from '@js/Services/LocalisationService';

    export default {
        props: {
            options  : {
                type   : [Object, Array],
                default: () => []
            },
            value    : {
                type   : [String, Number],
                default: null
            },
            translate: {
                type   : Boolean,
                default: true
            }
        },

        computed: {
            optionList() {
                let options = [];

                for(let id in this.options) {
                    if(!this.options.hasOwnProperty(id)) continue;
                    let config = this.options[id];

                    if(typeof config === 'string') {
                        options.push({id, label: config, disabled: false, description: null});
                    } else {
                        let option = {
                            id         : config.hasOwnProperty('id') ? config.id:id,
                            label      : config.label,
                            disabled   : config.hasOwnProperty('disabled') ? config.disabled === true:false,
                            description: config.hasOwnProperty('description') ? config.description:null
                        };

                        options.push(option);
                    }
                }

                return options;
            },
            listeners() {
                let listeners = {};

                for(let key in this.$listeners) {
                    if(this.$listeners.hasOwnProperty(key) && key !== 'input' && key !== 'change') {
                        listeners[key] = this.$listeners[key];
                    }
                }

                return listeners;
            }
        },

        methods: {
            getTranslated(text) {
                if(!this.translate || !text) return text;

                return LocalisationService.translate(text);
            },
            handleChange($event) {
                this.$emit('change', $event.target.value);
                this.$emit('input', $event.target.value);
            }
        }
    };
</script>