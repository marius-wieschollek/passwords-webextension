<template>
    <div :class="classList">
        <label :for="id" @dblclick="edit()" :title="title">{{ label }}</label>
        <div @dblclick="edit()" v-if="!editing" :title="title">{{ text }}</div>
        <input-field :id="id" v-model="value" @keypress="checkEnter($event)" title="TitleEnterToExit" v-else-if="type === 'text'"/>
        <slider-field :id="id" v-model="value" v-else/>
    </div>
</template>

<script>
    import LocalisationService from '@js/Services/LocalisationService';
    import MiningItem from '@js/Models/Queue/MiningItem';
    import MessageService from '@js/Services/MessageService';
    import InputField from '@vue/Components/Form/InputField';
    import SliderField from "@vue/Components/Form/SliderField";

    export default {
        components: {SliderField, InputField},
        props     : {
            item : {
                type: MiningItem
            },
            field: {
                type: String
            }
        },

        data() {
            return {
                editing: this.field === 'hidden',
                value  : this.item.getResultField(this.field)
            };
        },

        computed: {
            label() {
                if(['label', 'url', 'username', 'password', 'hidden'].indexOf(this.field) !== -1) {
                    return LocalisationService.translate(`Label${this.field.capitalize()}`);
                }

                return this.field;
            },
            text() {
                return this.field === 'password' ? '':this.value;
            },
            classList() {
                return `mining-property field-${this.field}`;
            },
            id() {
                return `property-${this.field}`;
            },
            type() {
                return this.field === 'hidden' ? 'checkbox':'text';
            },
            title() {
                if(this.field === 'hidden') return '';
                return this.editing ? LocalisationService.translate('TitleEnterToExit'):LocalisationService.translate('TitleClickToEdit');
            }
        },

        methods: {
            edit() {
                this.editing = true;
            },
            checkEnter($event) {
                if($event.key === 'Enter') {
                    $event.preventDefault();
                    this.editing = false;
                    this.item.setResultField(this.field, this.value);

                    MessageService
                        .send({type: 'popup.mining.update', payload: this.item});
                }
            }
        },
        watch  : {
            value(value) {
                this.item.setResultField(this.field, value);
            }
        }

    };
</script>

<style lang="scss">
.mining-property {
    padding : .5rem;

    label {
        cursor      : pointer;
        display     : block;
        font-weight : bold;
        color       : var(--element-active-fg-color)
    }

    div {
        cursor        : pointer;
        padding       : .25rem;
        box-sizing    : border-box;
        border-radius : 3px;
        border        : none;
        line-height   : 2rem;
        height        : 2.5rem;
        white-space   : nowrap;
        text-overflow : ellipsis;
        overflow      : hidden;
        box-shadow    : 0 0 0 1px transparent;
        transition    : box-shadow .15s ease-in-out;
        color         : var(--element-fg-color);

        &:hover {
            box-shadow : 0 0 0 1px var(--element-hover-bg-color);
        }
    }

    input {
        width            : 100%;
        padding          : .25rem;
        box-sizing       : border-box;
        box-shadow       : 0 0 0 1px var(--element-active-fg-color);
        border-radius    : 3px;
        border           : none;
        line-height      : 2rem;
        background-color : var(--element-bg-color);
        color            : var(--element-fg-color);
    }

    &.field-password {
        div {
            font-family    : "Font Awesome 5 Free", sans-serif;
            font-size      : .5rem;
            letter-spacing : .25rem;
            font-weight    : bold;
        }
    }

    &.field-hidden {
        display : flex;

        label {
            flex-grow : 1;
        }

        .input-slider {
            margin-top : 2px;
        }
    }
}
</style>