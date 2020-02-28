<template>
    <select v-model="model">
        <option v-for="option in optionList"
                :key="option.id"
                :value="option.id"
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
                type   : String,
                default: null
            },
            translate: {
                type   : Boolean,
                default: true
            }
        },

        data() {
            return {
                model: this.value,
                emit : this.value
            };
        },

        computed: {
            optionList() {
                let options = [];

                for(let id in this.options) {
                    if(!this.options.hasOwnProperty(id)) continue;
                    let config = this.options[id];

                    if(typeof config === 'string') {
                        options.push({id, label: config, description: null});
                    } else {
                        let option = {
                            id         : config.hasOwnProperty('id') ? config.id:id,
                            label      : config.label,
                            description: config.hasOwnProperty('description') ? config.description:null
                        };

                        options.push(option);
                    }
                }

                return options;
            }
        },

        methods: {
            getTranslated(text) {
                if(!this.translate || !text) return text;

                return LocalisationService.translate(text);
            }
        },

        watch: {
            model(value) {
                if(this.emit !== value) {
                    this.emit = value;
                    this.$emit('input', value);
                }
            },
            value(value) {
                this.emit = value;
                this.model = value;
            }
        }
    };
</script>