<template>
    <div class="password-details-view">
        <div class="password-details-header">
            <icon class="close" icon="chevron-left" font="solid" @click="$emit('close')"/>
            <div class="title">
                {{ password.getLabel() }}
            </div>
            <div class="options">
                <icon :class="securityClass" icon="shield-alt" font="solid"/>
                <icon class="favorite" @click="updateFavorite()" icon="star" :font="favoriteFont"/>
                <icon v-if="canEdit" class="option" icon="pen" font="solid" @click="toggleAction()"/>
                <icon v-if="isEditMode" class="option" icon="save" @click="toggleAction()" :class="canSave"/>
            </div>
        </div>
        <div class="password-details-fields">
            <property :editable="isEditMode" :field="field" v-for="field in defaultFields" :key="field.name" v-on:updateField="updateField" v-on:error="handleValidationError"/>
            <custom-property :field="field"
                             :editable="isEditMode"
                             v-for="field in customFields"
                             :key="field.label"
                             v-on:updateField="updateCustomField"
                             v-on:error="handleValidationError"
                             :maxLength="customFieldLength"/>
            <property :editable="false" :field="field" v-for="field in statFields" :key="field.name"/>
        </div>
    </div>
</template>

<script>
    import Icon from '@vue/Components/Icon';
    import Password from 'passwords-client/src/Model/Password/Password';
    import Property from '@vue/Components/Password/Property';
    import CustomProperty from '@vue/Components/Password/CustomProperty';
    import MessageService from '@js/Services/MessageService';
    import ToastService from "@js/Services/ToastService";
    import ErrorManager from "@js/Manager/ErrorManager";

    export default {
        components: {Icon, Property, CustomProperty},
        props     : {
            password: {
                type: Password
            }
        },

        data() {
            return {
                isEditMode       : false,
                defaultFields    : this.getDefaultFields(),
                customFields     : this.getCustomFields(),
                updatedFields    : {},
                errorQueue       : [],
                customFieldLength: 8192
            };
        },

        computed: {
            securityClass() {
                let types = ['secure', 'warn', 'bad'];

                return `security ${types[this.password.getStatus()]}`;
            },
            favoriteFont() {
                if(this.password.getProperty('favorite') === true) {
                    return 'solid';
                }
                return 'reqular';
            },
            sharedIcon() {
                if(this.password.getProperty('shared') === true) {
                    return 'users';
                }
                return 'user-shield';
            },
            showNewCustomField() {
                return this.allowNewCustomField();
            },
            canEdit() {
                return !this.isEditMode && this.password.isEditable();
            },
            canSave() {
                return this.errorQueue.length > 0 ? 'disabled':'';
            },
            statFields() {
                return [
                    this.getFieldObject('folder', 'folder', false, false, false, undefined),
                    this.getFieldObject('edited', 'datetime', false, false, false, undefined),
                    this.getFieldObject('created', 'datetime', false, false, false, undefined)
                ];
            }
        },

        methods: {
            getDefaultFields() {
                let fields = [];
                for(let property in this.password.getProperties()) {
                    if(property === 'password') {
                        fields.push(this.getFieldObject(property, 'password', true, true, true, 256));
                    } else if(property === 'label') {
                        fields.push(this.getFieldObject(property, 'text', true, true, false, 64));
                    } else if(property === 'notes') {
                        fields.push(this.getFieldObject(property, 'textarea', true, false, true, 4096));
                    } else if(property === 'url') {
                        fields.push(this.getFieldObject(property, 'url', true, false, true, 2048));
                    } else if(property === 'username') {
                        fields.push(this.getFieldObject(property, 'text', true, false, true, 64));
                    } else if(property === 'hidden') {
                        fields.push(this.getFieldObject(property, 'checkbox', true, false, false, undefined));
                    }
                }
                return fields;
            },
            getFieldObject(property, type, editable, required, allowCopy, maxLength) {
                return {
                    name : property,
                    type,
                    value: this.password.getProperty(property),
                    editable,
                    allowCopy,
                    required,
                    maxLength
                };
            },
            getCustomFields() {
                let result = this.password.getProperty('customFields');
                result.push(this.getNewCustomField());
                this.customFieldLength = 8192 - JSON.stringify(result).length;
                return result;
            },
            getNewCustomField() {
                return (
                    {
                        label: '',
                        value: '',
                        type : 'text'
                    }
                );
            },
            allowNewCustomField() {
                if(this.customFields === undefined
                   || this.customFields.length >= 20) {
                    return false;
                }
                if(this.updatedFields !== undefined
                   && this.updatedFields.customFields !== undefined
                   && this.updatedFields.customFields.length >= 20) {
                    return false;
                }
                return true;
            },
            async updateFavorite() {
                let data = {
                    id      : this.password.getId(),
                    favorite: !this.password.getFavorite()
                };
                let response = await MessageService.send({type: 'password.update', payload: {data: data}});
                if(response.getPayload().success) {
                    ToastService.success('ToastPasswordUpdated').catch(ErrorManager.catch);
                    this.password.setProperties(response.getPayload().data);
                } else {
                    ToastService.error(response.getPayload().message).catch(ErrorManager.catch);
                }
            },
            toggleAction() {
                if(this.errorQueue.length > 0) return;
                if(this.isEditMode === true) {
                    this.save();
                }
                this.isEditMode = !this.isEditMode;
            },
            async save() {
                if(Object.keys(this.updatedFields).length !== 0) {
                    this.removeEmptyCustomFields();
                    this.updatedFields.id = this.password.getId();
                    let response = await MessageService.send({type: 'password.update', payload: {data: this.updatedFields}});
                    if(response.getPayload().success) {
                        ToastService.success('ToastPasswordUpdated').catch(ErrorManager.catch);
                        this.password.setProperties(response.getPayload().data);
                    } else {
                        ToastService.error(response.getPayload().message).catch(ErrorManager.catch);
                    }

                    this.updatedFields = {};
                }
            },
            updateField(field, value) {
                this.updatedFields[field] = value;
            },
            updateCustomField() {
                this.updatedFields.customFields = this.customFields;
                this.customFieldLength = 8192 - JSON.stringify(this.customFields).length;
                if(!this.allowNewCustomField()) return;
                let emptyFieldAvailable = false;
                this.updatedFields.customFields.forEach((e) => {
                    if(e.label === '' && e.value === '' && e.type !== 'data' && e.type !== 'file') {
                        emptyFieldAvailable = true;
                    }
                });
                if(!emptyFieldAvailable) {
                    this.customFields.push(this.getNewCustomField());
                }
            },
            removeEmptyCustomFields() {
                if(this.updatedFields.customFields === undefined) return;
                this.updatedFields.customFields.forEach((e) => {
                    if((e.label === '' && e.value === '' && e.type !== 'data' && e.type !== 'file')
                       || e.label === 'ext:field/' && e.type === 'data') {

                        let i = this.updatedFields.customFields.indexOf(e);
                        this.updatedFields.customFields.splice(i, 1);
                    }
                });
            },
            handleValidationError(field, error) {
                if(this.errorQueue.indexOf(field) !== -1) {
                    if(error === false) {
                        this.errorQueue.splice(this.errorQueue.indexOf(field), 1);
                    }
                } else {
                    if(error === true) {
                        this.errorQueue.push(field);
                    }
                }
            }
        }
    };
</script>

<style lang="scss">
.password-details-view {
    position         : absolute;
    top              : 0;
    left             : 0;
    bottom           : 0;
    right            : 0;
    z-index          : 2;
    background-color : var(--element-bg-color);
    color            : var(--element-fg-color);
    display          : flex;
    flex-direction   : column;

    .password-details-header {
        line-height      : 3rem;
        display          : flex;
        box-shadow       : var(--tab-active-border);
        background-color : var(--element-hover-bg-color);
        color            : var(--element-hover-fg-color);

        .icon {
            width      : 3rem;
            text-align : center;
            display    : inline-block;

            &.close {
                width  : 2rem;
                cursor : pointer;
            }
        }

        .title {
            font-size : 1.25rem;
            flex-grow : 1;
        }

        .options {
            .security {
                &.secure {
                    color : var(--success-bg-color)
                }

                &.warn {
                    color : var(--warning-bg-color)
                }

                &.bad {
                    color : var(--error-bg-color)
                }
            }

            .favorite {
                cursor : pointer;
                color  : var(--warning-bg-color);
            }

            .icon.option {
                cursor : pointer;

                &:not(.disabled) {
                    &:hover {
                        background-color : var(--button-hover-bg-color);
                        color            : var(--button-hover-fg-color);
                    }
                }

                &.disabled {
                    opacity : .5;
                }
            }
        }
    }

    .password-details-fields {
        scrollbar-width : thin;
        overflow        : auto;
        flex-grow       : 1;

        label.custom-fields {
            display        : block;
            font-weight    : 550;
            line-height    : 1rem;;
            padding-left   : .5rem;
            padding-bottom : .25rem;
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

        input:focus,
        select:focus,
        textarea:focus,
        button:focus {
            outline : none;
        }

        a {
            width            : 100%;
            padding          : .25rem;
            line-height      : 2rem;
            background-color : var(--element-hover-bg-color);
            color            : var(--element-active-fg-color);
        }
    }
}
</style>