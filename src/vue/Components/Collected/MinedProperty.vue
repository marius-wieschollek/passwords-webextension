<template>
    <div class="mining-property">
        <label :for="id" @dblclick="edit()">{{label}}</label>
        <span @dblclick="edit()" v-if="!editing">{{value}}</span>
        <input :id="id" v-model="value" v-else @keypress="checkEnter($event)"/>
    </div>
</template>

<script>
    import LocalisationService from '@js/Services/LocalisationService';
    import MiningItem from '@js/Models/Queue/MiningItem';

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
                editing: false,
                value  : this.item.getResultField(this.field)
            };
        },

        computed: {
            label() {
                if(['label', 'url', 'username', 'password'].indexOf(this.field) !== -1) {
                    return LocalisationService.translate(`Label${this.field.capitalize()}`);
                }

                return this.field;
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
                }
            }
        },
        watch: {
            value(value) {
                this.item.setResultField(this.field, value);
            }
        }

    };
</script>

<style lang="scss">
    .mining-property {
        display               : grid;
        grid-template-columns : 4fr 6fr;
        grid-row-gap          : .25rem;
        padding               : .25rem;

        span,
        label {
            padding : .5rem .25rem;
            cursor  : pointer;
        }

        input {
            width         : 100%;
            padding       : .5rem .25rem;
            box-sizing    : border-box;
            box-shadow    : 0 0 0 1px var(--content-primary-border-color);
            border-radius : 3px;
            border        : none;
        }
    }
</style>