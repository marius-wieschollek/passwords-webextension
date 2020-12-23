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
                if(this.title.length === 0) return;

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
        background-color : var(--element-active-fg-color);
        border-radius    : var(--button-border-radius-large);
        width            : 100%;
        display          : inline-block;
        height           : 100%;
    }

    .input-slider-button {
        background-color : var(--element-active-bg-color);
        border-radius    : var(--button-border-radius-large);
        border           : 2px solid var(--element-active-fg-color);
        position         : absolute;
        top              : 0;
        left             : 0;
        height           : 100%;
        width            : 1em;
        transition       : left .15s ease-in-out;
        box-sizing       : border-box;
    }

    &.on {
        .input-slider-button {
            left : calc(100% - 1em);
        }
    }

    input {
        display : none;
    }
}
</style>