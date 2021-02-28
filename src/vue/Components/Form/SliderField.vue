<template>
    <span :class="getClassNames" @click.stop="toggleSwitch" :title="getTitle">
        <span class="input-slider-bar"></span>
        <span class="input-slider-button"></span>
        <input type="checkbox"
               ref="checkbox"
               :id="id"
               :name="name"
               v-model="model"
               v-on="listeners"/>
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
            }
        },

        data() {
            return {
                model: this.value
            };
        },

        computed: {
            getClassNames() {
                return 'input-slider ' + (this.value ? 'on':'off');
            },
            getTitle() {
                if(this.title.length === 0) {
                    return LocalisationService.translate(this.value ? 'InputSliderOn':'InputSliderOff');
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
                this.model = !this.model;
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
    height      : 1em;
    cursor      : pointer;

    .input-slider-bar {
        margin           : 0;
        background-color : var(--element-hover-bg-color);
        border-radius    : var(--button-border-radius-large);
        border           : 2px solid var(--element-hover-bg-color);
        width            : 100%;
        display          : inline-block;
        height           : 100%;
    }

    .input-slider-button {
        background-color : var(--element-fg-color);
        border-radius    : var(--button-border-radius-large);
        position         : absolute;
        top              : 2px;
        left             : 2px;
        height           : calc(1em - 4px);
        width            : calc(1em - 4px);
        transition       : left .15s ease-in-out;
        box-sizing       : border-box;
    }

    &.on {
        .input-slider-bar {
            background-color : var(--element-active-fg-color);
            border           : 2px solid var(--element-active-fg-color);
        }

        .input-slider-button {
            left : calc(100% - 1em + 2px);
        }
    }

    input {
        display : none;
    }
}
</style>