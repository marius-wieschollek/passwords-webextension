<template>
    <div :class="classList" v-if="showField">
        <div :class="'property-label' + activeClassName">
            <label v-if="!editable">{{label}}</label>
            <input-field v-else :class="labelClassName" v-model="label"/>
            <select-field :class="activeClassName" v-model="type" :options="customTypeOptions" :disabled="!editable"/>
        </div>
        <div class="property-value">
            <a v-if="field.type === 'url' && !editable" :href="value">{{text}}</a>
            <input-field v-else :class="activeClassName" @click="copy(field.name)" :type="getInputType" v-model="value" :readonly="!editable"/>
            <div class="password-eye">
                <icon v-if="field.type === 'secret'" @click="plainText = !plainText" :icon="passwordIcon" font="solid"/>
            </div>
        </div>
    </div>
</template>

<script>
    import InputField          from '@vue/Components/Form/InputField';
    import ToastService        from '@js/Services/ToastService';
    import MessageService      from '@js/Services/MessageService';
    import ErrorManager        from '@js/Manager/ErrorManager';
    import SelectField         from '@vue/Components/Form/SelectField';
    import Icon                from "@vue/Components/Icon";
    
    export default {
        components: { Icon, InputField, SelectField },
        props     : {
            field    : {
                type : Object
            },
            editable : {
                type : Boolean
            }
        },

        data() {
            return {
                value  : this.field.value,
                label  : this.field.label,
                type   : this.field.type,
                plainText: false
            };
        },

        computed: {
            customTypeOptions() {
                return [
                    {
                        id   : 'text',
                        label: 'PasswordCustomFieldsTypeText'
                    },
                    {
                        id   : 'secret',
                        label: 'PasswordCustomFieldsTypeSecret'
                    },
                    {
                        id   : 'email',
                        label: 'PasswordCustomFieldsTypeEmail'
                    },
                    {
                        id   : 'url',
                        label: 'PasswordCustomFieldsTypeUrl',
                    }
                ];
            },
            labelClassName() {
                return "label" + (this.editable === true ? " active": "");
            },
            activeClassName() {
                return this.editable === true ? " active": "";
            },
            showField() {
                if(this.field.type === "file") return false;
                if(this.field.type === "data") return false;
                if(this.editable || this.value !== '') {
                    return true;
                }
                return false;
            },
            label() {
               return this.field.label;
            },
            classList() {
                var result = "password-view-customproperty";
                if(!this.editable) {
                    result += " readonly";
                }
                if(this.field.type !== "url" && this.editable === false) {
                    result += " allow-copy";
                }
                return result;
            },
            passwordIcon() {
                if(this.plainText) {
                    return "eye-slash";
                }
                return "eye";
            },
            getInputType() {
                if(this.field.type === "secret" && this.plainText !== true) {
                    return "password";
                }
                return "text";
            }
        },

        methods: {
            copy() {
                if(this.editable) return;
                var type = (this.field.type === "secret" ? "password":"text");
                let data = this.field.value;
                MessageService.send({type: 'clipboard.write', payload: {type: type, value: data}}).catch(ErrorManager.catch);

                ToastService.success(['PasswordPropertyCopied', this.field.label])
                            .catch(ErrorManager.catch);
            },
        },
        watch  : {
            value(value) {
                if(value === undefined || null) return;
                this.field.value = value;
                this.$emit('updateField');
            },
            label(label) {
                if(label === undefined || null) return;
                this.field.label = label;
                this.$emit('updateField');
            },
            type(type) {
                if(type === undefined || null) return;
                this.field.type = type;
                this.$emit('updateField');
            },
            editable(value) {
                if(value === false) {
                    this.plainText = false;
                }
            }
        }

    };
</script>

<style lang="scss">
.password-view-customproperty {
    padding : .5rem;
    cursor  : initial;

    .property-label {
        display              : flex;
        flex-direction       : row;
        justify-content      : space-between;
        line-height          : 1rem;

        &.active {
            line-height      : 2rem;
            margin-bottom    : .25rem;
        }

        .input-select {
            padding          : 0;
            position         : relative;
            top              : -.25rem;

            select {
                padding      : 0 1.5rem 0 0;
            }

            &.active{
                padding      : .25rem;
                top          : 0;

                select {
                    padding  : .25rem 1.75rem .25rem .25rem;
                }
            }
        }

        label {
            font-weight      : 550;
        }
    
    } 


    .property-value {
        display          : flex;
        flex-direction   : row;
        position         : relative;
    }
    
    .password-eye {
        width            : 0;
        cursor           : pointer;

        .icon {
            position     : absolute;
            right        : 1rem;
            top          : .7rem;
        }
    }   

    .input-select {
        margin-left      : .25rem;
    }

    input {
        width            : 100%;
        padding          : .25rem;
        box-sizing       : border-box;
        border-radius    : 3px;
        border           : none;
        line-height      : 2rem;
        background-color : var(--element-hover-bg-color);
        color            : var(--element-fg-color);
    }

    input.active, .label.active, .input-select.active {
        box-shadow       : 0 0 0 1px var(--element-active-fg-color);
        
    }
    
    a {
        width            : 100%;
        padding          : .25rem;
        line-height      : 2rem;
        background-color : var(--element-hover-bg-color);
        color            : var(--element-active-fg-color);
    }

    .readonly {
        box-shadow       : none;
        border           : none;
    }

    &.allow-copy {
        input:hover, input:active {
            cursor       : pointer;
            border       : none;
        }
    }
}
</style>