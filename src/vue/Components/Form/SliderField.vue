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
    width       : 1.5em;
    height      : 1em;
    top         : -1px;
    cursor      : pointer;

    .input-slider-bar {
        margin           : .25em 0;
        background-color : var(--element-active-fg-color);
        border-radius    : var(--button-border-radius);
        width            : 100%;
        display          : inline-block;
        height           : .5em;
    }

    .input-slider-button {
        background-color : var(--element-active-bg-color);
        border-radius    : var(--button-border-radius);
        border           : 1px solid var(--element-active-fg-color);
        position         : absolute;
        top              : .1em;
        left             : 1px;
        height           : .8em;
        width            : .8em;
        transition       : left .15s ease-in-out;
    }

    &.on {
        .input-slider-button {
            left : .5rem;
        }
    }

    input {
        display : none;
    }
}
</style>