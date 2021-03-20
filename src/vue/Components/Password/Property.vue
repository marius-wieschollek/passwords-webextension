<template>
    <div :class="classList" v-if="canEdit || value !== ''">
        <div v-if="field.type === 'checkbox'" class="password-checkbox">
            <label class="property-label">{{ label }}</label>
            <slider-field v-model="value" :readonly="!canEdit" :class="activeClassName"/>
        </div>
        <label v-if="field.type !== 'checkbox'" class="property-label">{{ label }}</label>
        <div v-if="field.type !== 'checkbox'" class="property-value">
            <a v-if="field.type === 'url' && !canEdit" :href="value">{{text}}</a>
            <input-field v-else-if="field.type === 'datetime' || field.type === 'folder'" v-model="text" :readonly="true" class="readonly"/>
            <input-field v-else v-model="value" :type="getInputType" @click="copyProperty(field.name)" @dblclick="copyNotes(field.name)" :readonly="!canEdit" :class="activeClassName"/>
            <div class="password-icon">
                <icon v-if="editable && field.type === 'password'" @click="generatePassword" icon="sync" font="solid" :spin="generating"/>
                <icon v-if="field.type === 'password'" @click="plainText = !plainText" :icon="passwordIcon" font="solid"/>
            </div>
        </div>
        <label v-if="valueError" class="error">{{valueErrorText}}</label>
    </div>
</template>

<script>
    import Password            from 'passwords-client/src/Model/Password/Password';
    import InputField          from '@vue/Components/Form/InputField';
    import SliderField         from '@vue/Components/Form/SliderField';
    import ToastService        from '@js/Services/ToastService';
    import MessageService      from '@js/Services/MessageService';
    import ErrorManager        from '@js/Manager/ErrorManager';
    import LocalisationService from '@js/Services/LocalisationService';
    import SettingsService     from '@js/Services/SettingsService';
    import Icon                from "@vue/Components/Icon";
    
    export default {
        components: { Icon, InputField, SliderField },
        props     : {
            password : {
                type : Password
            },
            field    : {
                type : JSON
            },
            editable : {
                type : Boolean
            }
        },

        data() {
            return {
                value      : this.field.value,
                plainText  : false,
                folder     : undefined,
                valueError : false,
                generating : true,
                numbers    : false,
                special    : false,
                strength   : 1,
            };
        },

        async mounted() {
            var response = await MessageService.send({type: 'folder.show', payload: this.value});
            var payload = response.getPayload();
            if(payload !== undefined && payload !== null ) {
                this.folder = payload;
            }

            let promises = [
                this.loadSetting('strength'),
                this.loadSetting('numbers'),
                this.loadSetting('special')
            ];

            Promise.all(promises).then(() => {
                this.generating = false;
            });
        },

        computed: {
            canEdit() {
                if(this.editable && this.field.editable) {
                    return true;
                }
                return false;
            },
            label() {
               return LocalisationService.translate(`Label${this.field.name.capitalize()}`);
            },
            text() {
                var type = this.field.type;
                if(type === 'datetime') {
                    if(typeof this.value === "number") {
                        return new Date(this.value * 1000).toLocaleString();
                    } else {
                        return new Date(this.value.toString()).toLocaleString();
                    }
                }
                if(type === 'folder') {
                    if(this.folder === undefined) {
                        return this.value;
                    }
                    
                    return this.folder.getLabel();
                }
                return this.value;
            },
            classList() {
                var result = "password-view-property";
                if(!this.canEdit) {
                    result += " readonly";
                }
                if(this.field.allowCopy && this.editable === false) {
                    result += " allow-copy";
                }
                return result;
            },
            getInputType() {
                if(this.field.type === "textarea") {
                    return "textarea";
                }
                if(this.field.type === "password" && this.plainText !== true) {
                    return "password";
                }
                return "text";
            },
            activeClassName() {
                var result = this.editable === true ? " active": "";
                result += this.field.type === 'password' ? ' password-edit':'';
                return result;
            },
            passwordIcon() {
                if(this.plainText) {
                    return "eye-slash";
                }
                return "eye";
            },
            valueErrorText() {
                if(!this.validateUrl()) {
                    return LocalisationService.translate(`PasswordEditInvalidValue`);
                }
                return LocalisationService.translate([`PasswordEditMaxAllowedCharacter`, this.field.maxLength]);
            }
        },

        methods: {
            copy(property) {
                let data = this.field.value;
                MessageService.send({type: 'clipboard.write', payload: {type: this.field.type, value: data}}).catch(ErrorManager.catch);

                let label = LocalisationService.translate(`Label${property.capitalize()}`);
                ToastService.success(['PasswordPropertyCopied', label])
                            .catch(ErrorManager.catch);
            },
            copyProperty(property) {
                if(this.field.allowCopy == false || this.editable === true || property === 'notes') return;
                this.copy(property);
            },
            copyNotes(property) {
                if(this.editable === true || property !== 'notes') return;
                this.copy(property);
            },
            async loadSetting(type) {
                this[type] = await SettingsService.getValue(`password.generator.${type}`);
            },
            async generatePassword() {
                if(this.generating) return;
                this.generating = true;
                let response = /** @type {Message} **/ await MessageService
                    .send({type: 'password.generate', payload: {numbers: this.numbers, special: this.special, strength: this.strength}});
                let data = response.getPayload();
                if(data.success) {
                    this.value = data.password;
                }
                this.generating = false;
            },
            validateLength() {
                if(this.field.maxLength === undefined) return true;
                if(this.field.maxLength <= this.value.length) {
                    return false;
                }
                return true;
            },
            validateUrl() {
                if(this.field.type !== "url") return true;
                var urlRegex = /^(https?|ftps?|ssh):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i
                var uncRegex = /^\\\\([^\\:\|\[\]\/";<>+=,?* _]+)\\([\u0020-\u0021\u0023-\u0029\u002D-\u002E\u0030-\u0039\u0040-\u005A\u005E-\u007B\u007E-\u00FF]{1,80})(((?:\\[\u0020-\u0021\u0023-\u0029\u002D-\u002E\u0030-\u0039\u0040-\u005A\u005E-\u007B\u007E-\u00FF]{1,255})+?|)(?:\\((?:[\u0020-\u0021\u0023-\u0029\u002B-\u002E\u0030-\u0039\u003B\u003D\u0040-\u005B\u005D-\u007B]{1,255}){1}(?:\:(?=[\u0001-\u002E\u0030-\u0039\u003B-\u005B\u005D-\u00FF]|\:)(?:([\u0001-\u002E\u0030-\u0039\u003B-\u005B\u005D-\u00FF]+(?!\:)|[\u0001-\u002E\u0030-\u0039\u003B-\u005B\u005D-\u00FF]*)(?:\:([\u0001-\u002E\u0030-\u0039\u003B-\u005B\u005D-\u00FF]+)|))|)))|)$/;
                
                if(urlRegex.test(this.value) || uncRegex.test(this.value)) {
                    return true;
                }
                return false;
            }            
        },  
                
        watch  : {
            value(value) {
                if(value === undefined || value === null) return;
                if(this.validateLength() && this.validateUrl()) {
                    this.valueError = false;
                    this.$emit('updateField', this.field.name, value);
                    this.$emit('error', this.field, false);
                } else {
                    this.$emit('error', this.field, true)
                    this.valueError = true;
                }
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
.password-view-property {
    padding : .5rem;
    cursor  : initial;

    padding : .5rem;
    cursor  : initial;

    .property-label {
        display          : block;
        font-weight      : 550;
        line-height      : 1rem;
    }

    .property-value {
        display          : flex;
        flex-direction   : row;
        position         : relative;
    }

    .password-icon {
        cursor           : pointer;
        position         : absolute;
        right            : .5rem;
        top              : .75rem;
        background-color : var(--element-hover-bg-color);

        span.icon {
            width        : 1.75rem;
        }
    }

    input.password-edit {
        padding-right: 2.5rem !important;
        
        &.active {
            padding-right: 4.5rem !important;
        }
    }

    
    input.active, textarea.active, .label.active {
        box-shadow       : 0 0 0 1px var(--element-active-fg-color);
        
        &.error{
            box-shadow   : 1px 1px 1px 0px var(--error-bg-color);
            border       : solid;
            border-width : .3px;
            border-color : var(--error-bg-color);
        }
    }

    label.error {
        padding          : .25rem;
        color            : var(--error-bg-color);
        line-height      : 1.5rem;

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
    
    .password-checkbox {
        display          : flex;
        flex-direction   : row;
        justify-content  : space-between;
        padding-right    : 1rem;

        .input-slider {
            cursor       : default;

            &.active {
                cursor   : pointer;
            }
        }
    }
}
</style>