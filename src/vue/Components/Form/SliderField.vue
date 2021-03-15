<template>
    <span :class="getClassNames" @click.stop="toggleSwitch" :title="getTitle">
        <span class="input-slider-bar"></span>
        <span class="input-slider-button"></span>
        <input type="checkbox"
               ref="checkbox"
               :id="id"
               :name="name"
               :readonly="readonly"
               v-model="model"
               v-on="listeners" />
    </span>
</template>

<script>
    import LocalisationService from '@js/Services/LocalisationService';

    export default {
        props: {
            value: {
                type   : Boolean,
                default: false
            },
            title: {
                type   : String,
                default: ''
            },
            id   : {
                type   : String,
                default: undefined
            },
            name : {
                type   : String,
                default: undefined
            },
            readonly: {
                type   : Boolean,
                default: false
            }
        },

        data() {
            return {
                model: this.value
            };
        },

        computed: {
            getClassNames() {
                return 'input-slider ' + (this.value ? 'on' : 'off');
            },
            getTitle() {
                if(this.title.length === 0) {
                    return LocalisationService.translate(this.value ? 'InputSliderOn' : 'InputSliderOff');
                }

                return LocalisationService.translate(this.title);
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
            toggleSwitch() {
                if(this.readonly === false) {
                    this.model = !this.model;
                }
            }
        },

        watch: {
            value(value) {
                if(this.model !== value) this.model = value;
            },
            model(value) {
                if(this.value !== value) {
                    this.$emit('change', value);
                    this.$emit('input', value);
                }
            }
        }
    };
</script>

<style lang="scss">
.input-slider {
    position    : relative;
    display     : inline-flex;
    align-items : center;
    width       : 1.75em;
    height      : 1.1em;
    min-width   : 1.75em;
    cursor      : pointer;
    flex-shrink : 0;
    flex-grow   : 0;

    .input-slider-bar {
        margin           : 0;
        background-color : var(--slider-bg-color);
        border-radius    : var(--slider-border-radius);
        border           : 1px solid var(--slider-br-color);
        width            : 100%;
        display          : inline-block;
        height           : 100%;
    }

    .input-slider-button {
        background-color : var(--slider-fg-color);
        border-radius    : var(--slider-border-radius);
        border           : 1px solid var(--slider-br-color);
        position         : absolute;
        top              : 2px;
        left             : 2px;
        height           : calc(1.1em - 4px);
        width            : calc(1.1em - 4px);
        transition       : left .15s ease-in-out;
        box-sizing       : border-box;
        overflow         : hidden;
    }

    &.on {
        .input-slider-bar {
            background-color : var(--slider-active-bg-color);
            border-color     : var(--slider-active-br-color);
        }

        .input-slider-button {
            left             : calc(100% - 1.1em + 2px);
            background-color : var(--slider-active-fg-color);
            border-color     : var(--slider-active-br-color);
        }
    }

    input {
        display : none;
    }
}
</style>