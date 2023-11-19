<template>
    <div class="password-details-view">
        <div class="password-details-header">
            <icon class="close" icon="chevron-left" font="solid" @click="$emit('close')"/>
            <div ref="scrollContainer" class="scroll-container" :style="titleVars" v-on:mouseenter="calculateOverflow">
                <span ref="scrollElement" class="scroll-element" :class="titleClass">{{ password.getLabel() }}</span>
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
            <translate tag="label" say="LabelCustomFields" class="custom-fields" v-if="isEditMode" />
            <custom-property :field="field"
                             :editable="isEditMode"
                             v-for="field in customFields"
                             :key="field.id"
                             v-on:error="handleValidationError"
                             v-on:updated="handleFieldUpdate"
                             :maxLength="customFieldLength"/>
            <property :editable="false" :field="field" v-for="field in statFields" :key="field.name"/>
        </div>
    </div>
</template>

<script>
    import Icon           from '@vue/Components/Icon';
    import {Password}     from 'passwords-client/models';
    import Property       from '@vue/Components/Password/Property';
    import CustomProperty from '@vue/Components/Password/CustomProperty';
    import MessageService from '@js/Services/MessageService';
    import ToastService   from "@js/Services/ToastService";
    import ErrorManager   from "@js/Manager/ErrorManager";
    import Translate      from '@vue/Components/Translate.vue';

    export default {
        components: {Translate, Icon, Property, CustomProperty},
        props     : {
            password: {
                type: Password
            }
        },

        data() {
            return {
                isEditMode   : false,
                defaultFields: this.getDefaultFields(),
                customFields : this.getCustomFields(),
                updatedValues: {},
                errorQueue   : [],
                overflow     : 0
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
            customFieldLength() {
                return 8192 - JSON.stringify(this.getValidatedCustomFields()).length;
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
            },
            titleClass() {
                return this.overflow > 0 ? 'scroll-on-hover':'';
            },
            titleVars() {
                return `--overflow-size:-${this.overflow}px`;
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
            getCustomFields() {
                let editFields = [];

                for(let field of this.password.getCustomFields()) {
                    editFields.push(
                        {
                            id   : self.crypto.randomUUID(),
                            label: field.label,
                            value: field.value,
                            type : field.type
                        }
                    );
                }

                if(editFields.length < 20) {
                    editFields.push(
                        {
                            id   : self.crypto.randomUUID(),
                            label: '',
                            value: '',
                            type : 'text'
                        }
                    );
                }

                return editFields;
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
                let customFields = this.getValidatedCustomFields();
                if(JSON.stringify(customFields) !== JSON.stringify(this.password.getCustomFields())) {
                    this.updatedValues.customFields = customFields;
                }

                if(Object.keys(this.updatedValues).length !== 0) {
                    this.updatedValues.id = this.password.getId();
                    let response = await MessageService.send({type: 'password.update', payload: {data: this.updatedValues}});
                    if(response.getPayload().success) {
                        ToastService.success('ToastPasswordUpdated').catch(ErrorManager.catch);
                        this.password.setProperties(response.getPayload().data);
                    } else {
                        ToastService.error(response.getPayload().message).catch(ErrorManager.catch);
                    }

                    this.updatedValues = {};
                }
            },
            updateField(field, value) {
                this.updatedValues[field] = value;
            },
            getValidatedCustomFields() {
                let json = [];

                for(let field of this.customFields) {
                    if(field.label === '' || field.value === '' || ['text', 'secret', 'email', 'url', ' file', 'data'].indexOf(field.type) === -1) continue;

                    json.push(
                        {
                            label: field.label,
                            type : field.type,
                            value: field.value
                        }
                    );
                }

                if(json.length > 20) {
                    json = json.slice(0, 20);
                }

                return json;
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
            },
            handleFieldUpdate(field) {
                let hasEmpty = false;
                for(let customField of this.customFields) {
                    if(customField.id === field.id) {
                        customField.type = field.type;
                        customField.label = field.label;
                        customField.value = field.value;
                    }

                    if(customField.label === '' || customField.value === '') hasEmpty = true;
                }

                if(hasEmpty) return;
                this.customFields.push(
                    {
                        id   : self.crypto.randomUUID(),
                        label: '',
                        value: '',
                        type : 'text'
                    }
                );
            },
            calculateOverflow() {
                let overflow = this.$refs.scrollElement.scrollWidth - this.$refs.scrollContainer.offsetWidth;
                this.overflow = overflow > 5 ? overflow:0;
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

        .scroll-container {
            overflow  : hidden;
            font-size : 1.25rem;
            flex-grow : 1;
            position  : relative;

            .scroll-element {
                position    : absolute;
                white-space : nowrap;

                &.scroll-on-hover {
                    transform  : translateX(0);
                    transition : 2s;
                }
            }

            &:hover .scroll-element.scroll-on-hover {
                transform : translateX(var(--overflow-size));
            }
        }

        .options {
            flex-shrink : 0;

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