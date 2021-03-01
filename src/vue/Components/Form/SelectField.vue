<template>
    <div class="input-select" :class="{disabled:disabled}">
        <select @change="handleChange" v-on="listeners" v-bind="$attrs" :id="id" :disabled="disabled">
            <option v-for="option in optionList"
                    :key="option.id"
                    :value="option.id"
                    :disabled="option.disabled"
                    :selected="option.id === value"
                    :title="getTranslated(option.description)">{{ getTranslated(option.label) }}
            </option>
        </select>
    </div>
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
            },
            disabled : {
                type   : Boolean,
                default: false
            },
            id       : {
                type   : String,
                default: ''
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
                            id         : config.hasOwnProperty('id') ? config.id : id,
                            label      : config.label,
                            disabled   : config.hasOwnProperty('disabled') ? config.disabled === true : false,
                            description: config.hasOwnProperty('description') ? config.description : null
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

<style lang="scss">
.input-select {
    cursor           : pointer;
    background-color : var(--element-hover-bg-color);
    border-radius    : var(--button-border-radius);
    position         : relative;

    select {
        border           : 0;
        cursor           : pointer;
        appearance       : none;
        background-color : rgba(0, 0, 0, 0);
        padding          : .25rem 1.75rem .25rem .25rem;
        position         : relative;
        width            : 100%;
        z-index          : 1;
        overflow         : hidden;
        text-overflow    : ellipsis;
        color            : var(--element-fg-color);
    }

    &.disabled {
        opacity : 0.5;
        cursor  : not-allowed;

        select {
            cursor : not-allowed;
        }
    }

    &:after {
        font-family : var(--font-family-icon);
        font-weight : var(--font-weight-icon);
        content     : "\f078";
        position    : absolute;
        right       : .5rem;
        top         : 0;
        bottom      : 0;
        display     : flex;
        align-items : center;
        z-index     : 0;
        opacity     : 0.5;
    }
}
</style>