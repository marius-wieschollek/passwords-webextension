<template>
    <div :class="classList" v-if="canEdit || value !== ''">
        <div v-if="field.type === 'checkbox'" class="password-checkbox">
            <label class="property-label">{{ label }}</label>
            <slider-field v-model="value" :readonly="!canEdit" :class="activeClassName"/>
        </div>
        <div v-else>
            <label class="property-label">{{ label }}</label>
            <div class="property-value">
                <a v-if="field.type === 'url' && !canEdit" :href="value">{{text}}</a>
                <input-field v-else-if="field.type === 'datetime' || field.type === 'folder'" v-model="text" :readonly="true" class="readonly"/>
                <input-field v-else v-model="value" :type="getInputType" @click="copyProperty(field.name)" @dblclick="copyNotes(field.name)" :readonly="!canEdit" :class="activeClassName"/>
                <div class="password-eye">
                    <icon v-if="field.type === 'password'" @click="plainText = !plainText" :icon="passwordIcon" font="solid"/>
                </div>
            </div>
        </div>
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
                value  : this.password.getProperty(this.field.name),
                plainText: false,
                folder: undefined
            };
        },

        async mounted() {
            var response = await MessageService.send({type: 'folder.show', payload: this.value});
            var payload = response.getPayload();
            if(payload !== undefined && payload !== null ) {
                this.folder = payload;
            }
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
                    return new Date(this.value * 1000).toLocaleString();
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
                return this.editable === true ? " active": "";
            },
            passwordIcon() {
                if(this.plainText) {
                    return "eye-slash";
                }
                return "eye";
            }
        },

        methods: {
            copy(property) {
                let data = this.password.getProperty(property);
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
            }
        },
        
        watch  : {
            value(value) {
                if(value === undefined || value === null) return;
                this.$emit('updateField', this.field.name, value);
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

    .password-eye {
        width            : 0;
        cursor           : pointer;

        .icon {
            position     : absolute;
            right        : 1rem;
            top          : .7rem;
        }
    }

    input, textarea {
        width            : 100%;
        padding          : .25rem;
        box-sizing       : border-box;
        border-radius    : 3px;
        border           : none;
        line-height      : 2rem;
        background-color : var(--element-hover-bg-color);
        color            : var(--element-fg-color);
        scrollbar-width  : thin;
    }

    input.active, textarea.active, .label.active {
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
    
    .password-checkbox {
        display          : flex;
        flex-direction   : row;
        justify-content  : space-between;
        padding-right    : 1rem;
    }
}
</style>