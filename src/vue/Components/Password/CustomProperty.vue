<template>
    <div :class="classList" v-if="showField">
        <div :class="'property-label' + activeClassName">
            <input-field placeholder="CustomFieldLabelPlaceholder" :class="labelClassName" :readonly="!editable" v-model="label"/>
            <select-field v-if="editable" :class="activeClassName" v-model="type" :options="customTypeOptions"/>
        </div>
        <label v-if="labelError" class="error">{{ labelErrorText }}</label>
        <div class="property-value">
            <a v-if="type === 'url' && !editable" :href="value">{{ value }}</a>
            <input-field placeholder="CustomFieldValuePlaceholder" ref="value" v-else :class="valueClassName" @click="copy(field.name)" :type="getInputType" v-model="value" :readonly="!editable"/>
            <icon class="password-eye" v-if="type === 'secret'" @click="plainText = !plainText" :icon="passwordIcon" font="solid"/>
        </div>
        <label v-if="valueError" class="error">{{ valueErrorText }}</label>
    </div>
</template>

<script>
    import InputField from '@vue/Components/Form/InputField';
    import ToastService from '@js/Services/ToastService';
    import MessageService from '@js/Services/MessageService';
    import ErrorManager from '@js/Manager/ErrorManager';
    import SelectField from '@vue/Components/Form/SelectField';
    import Icon from "@vue/Components/Icon";
    import LocalisationService from '@js/Services/LocalisationService';

    export default {
        components: {Icon, InputField, SelectField},
        props     : {
            field    : {
                type: Object
            },
            editable : {
                type: Boolean
            },
            maxLength: {
                type: Number
            }
        },

        data() {
            return {
                value     : this.field.value,
                label     : this.getLabel(),
                type      : this.getType(),
                plainText : false,
                labelError: false,
                valueError: false
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
                        label: 'PasswordCustomFieldsTypeUrl'
                    },
                    {
                        id   : 'formfield',
                        label: 'PasswordCustomFieldsTypeFormField'
                    }
                ];
            },
            labelClassName() {
                let name = '';
                name += this.editable === true ? 'active':'label';
                name += this.labelError === true ? ' error':'';
                return name;
            },
            valueClassName() {
                let name = this.editable === true ? 'active':'';
                name += this.valueError === true ? ' error':'';
                name += this.type !== "url" && this.editable === false ? ' allow-copy':'';
                return name;
            },
            activeClassName() {
                return this.editable === true ? ' active':'';
            },
            showField() {
                if(this.type === 'file') return false;
                if(this.type === 'data' && !this.value.startsWith('ext:field/')) return false;
                return this.editable || this.value !== '';
            },
            classList() {
                let result = "password-view-customproperty";
                if(!this.editable) {
                    result += " readonly";
                }
                return result;
            },
            passwordIcon() {
                if(this.plainText) {
                    return 'eye-slash';
                }
                return 'eye';
            },
            getInputType() {
                if(this.type === 'secret' && this.plainText !== true) {
                    return 'password';
                }
                return 'text';
            },
            labelMaxLength() {
                return 368 - this.value.length;
            },
            valueMaxLength() {
                return 368 - this.value.length;
            },
            labelErrorText() {
                return LocalisationService.translate(['PasswordEditValidationMaxLength', this.labelMaxLength]);
            },
            valueErrorText() {
                if(!this.validateUrl()) {
                    return LocalisationService.translate('PasswordEditValidationInvalidValue');
                }
                if(!this.validateEmail()) {
                    return LocalisationService.translate('PasswordEditValidationInvalidValue');
                }
                return LocalisationService.translate(['PasswordEditValidationMaxLength', this.valueMaxLength]);
            }
        },

        methods: {
            copy() {
                if(this.editable) return;
                let type = (this.type === "secret" ? "password":"text");
                let data = this.value;
                MessageService.send({type: 'clipboard.write', payload: {type: type, value: data}}).catch(ErrorManager.catch);

                ToastService.success(['PasswordPropertyCopied', this.field.label])
                            .catch(ErrorManager.catch);
            },
            getType() {
                if(this.field.type === 'data' && this.field.label.startsWith('ext:field/')) {
                    return 'formfield';
                }
                return this.field.type;
            },
            getLabel() {
                if(this.field.type === 'data' && this.field.label.startsWith('ext:field/')) {
                    return this.field.label.replace('ext:field/', '');
                }
                return this.field.label;
            },
            validateUrl() {
                if(this.type !== "url") return true;
                let urlRegex = /^(https?|ftps?|ssh):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i;
                let uncRegex = /^\\\\([^\\:\|\[\]\/";<>+=,?* _]+)\\([\u0020-\u0021\u0023-\u0029\u002D-\u002E\u0030-\u0039\u0040-\u005A\u005E-\u007B\u007E-\u00FF]{1,80})(((?:\\[\u0020-\u0021\u0023-\u0029\u002D-\u002E\u0030-\u0039\u0040-\u005A\u005E-\u007B\u007E-\u00FF]{1,255})+?|)(?:\\((?:[\u0020-\u0021\u0023-\u0029\u002B-\u002E\u0030-\u0039\u003B\u003D\u0040-\u005B\u005D-\u007B]{1,255}){1}(?:\:(?=[\u0001-\u002E\u0030-\u0039\u003B-\u005B\u005D-\u00FF]|\:)(?:([\u0001-\u002E\u0030-\u0039\u003B-\u005B\u005D-\u00FF]+(?!\:)|[\u0001-\u002E\u0030-\u0039\u003B-\u005B\u005D-\u00FF]*)(?:\:([\u0001-\u002E\u0030-\u0039\u003B-\u005B\u005D-\u00FF]+)|))|)))|)$/;

                return urlRegex.test(this.value) || uncRegex.test(this.value);
            },
            validateEmail() {
                if(this.type !== "email") return true;
                const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                return emailRegex.test(String(this.value).toLowerCase());
            },
            updateLabel() {
                if(this.labelMaxLength >= this.label.length) {
                    this.labelError = false;
                    this.field.label = this.label;
                    return true;
                }
                this.labelError = true;
                return false;
            },
            updateValue() {
                if(this.validateEmail() && this.validateUrl()) {
                    if(this.valueMaxLength >= this.value.length) {
                        this.valueError = false;
                    }
                    this.field.value = this.value;
                    return true;
                }
                this.valueError = true;
                return false;
            },
            updateInput() {
                if(this.updateValue() && this.updateLabel()) {
                    if(this.type === 'formfield') {
                        this.field.label = 'ext:field/' + this.label.replace('ext:field/', '');
                        this.field.type = 'data';
                    } else {
                        this.field.type = this.type;
                    }

                    this.$emit('updated', this.field);
                    this.$emit('error', this.field, false);
                } else {
                    this.$emit('error', this.field, true);
                }
            }
        },

        watch: {
            value(value) {
                if(value === undefined || value === null) return;
                this.updateInput();
            },
            label(label) {
                if(label === undefined || label === null) return;
                this.updateInput();
            },
            type(type) {
                if(type === undefined || type === null) return;
                this.updateInput();
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
        display         : flex;
        flex-direction  : row;
        justify-content : space-between;
        line-height     : 1rem;

        &.active {
            line-height   : 2rem;
            margin-bottom : .25rem;
        }

        .input-select {
            padding  : 0;
            position : relative;
            top      : -.25rem;

            select {
                padding : 0 1.5rem 0 0;
            }

            &.active {
                padding : .25rem;
                top     : 0;

                select {
                    padding : .25rem 1.75rem .25rem .25rem;
                }
            }
        }

        input.active {
            font-weight : initial;
            cursor      : initial;
        }

        input.label {
            font-weight      : 600;
            padding          : 0;
            line-height      : 1rem;
            cursor           : default;
            background-color : var(--element-bg-color);
            color            : var(--element-fg-color);
        }
    }

    .property-value {
        display        : flex;
        flex-direction : row;
        position       : relative;
        overflow       : auto;
    }

    .password-eye {
        cursor           : pointer;
        position         : absolute;
        right            : 0rem;
        top              : .7rem;
        background-color : var(--element-hover-bg-color);
    }

    .input-select {
        margin-left : .25rem;
    }

    input.active, .label.active, .input-select.active {
        box-shadow : 0 0 0 1px var(--element-active-fg-color);

        &.error {
            box-shadow   : 1px 1px 1px 0 var(--error-bg-color);
            border       : solid;
            border-width : .3px;
            border-color : var(--error-bg-color);
        }
    }

    label.error {
        padding     : .25rem;
        color       : var(--error-bg-color);
        line-height : 1.5rem;
    }

    .readonly {
        box-shadow : none;
        border     : none;
    }

    input.allow-copy {
        &:hover, &:active {
            cursor : pointer;
            border : none;
        }
    }
}
</style>