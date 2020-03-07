<template>
    <div :class="classList">
        <label :for="id" @dblclick="edit()" :title="editing ? '':title">{{label}}</label>
        <div @dblclick="edit()" v-if="!editing" :title="title">{{text}}</div>
        <input :id="id" v-model="value" v-else @keypress="checkEnter($event)" :title="inputTitle"/>
    </div>
</template>

<script>
    import LocalisationService from '@js/Services/LocalisationService';
    import MiningItem from '@js/Models/Queue/MiningItem';
    import MessageService from '@js/Services/MessageService';

    export default {
        props: {
            item : {
                type: MiningItem
            },
            field: {
                type: String
            }
        },

        data() {
            return {
                editing   : false,
                value     : this.item.getResultField(this.field),
                title     : LocalisationService.translate('TitleClickToEdit'),
                inputTitle: LocalisationService.translate('TitleEnterToExit')
            };
        },

        computed: {
            label() {
                if(['label', 'url', 'username', 'password'].indexOf(this.field) !== -1) {
                    return LocalisationService.translate(`Label${this.field.capitalize()}`);
                }

                return this.field;
            },
            text() {
                return this.field === 'password' ? '':this.value;
            },
            classList() {
                return `mining-property ${this.field}`;
            },
            id() {
                return `property${this.field}`;
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

        &.password {
            div {
                font-family    : "Font Awesome 5 Free", sans-serif;
                font-size      : .5rem;
                letter-spacing : .25rem;
                font-weight    : bold;
            }
        }
    }
</style>