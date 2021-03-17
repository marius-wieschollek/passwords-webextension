<template>
    <div class="item-menu password-view">
        <div class="password-header">
            <div class="left-space"/>
            <div class="badge-container">
                <icon :class="securityClass" icon="shield-alt" font="solid"/>
                <icon class="favorite" @click="updateFavorite()" icon="star" :font="favoriteIconSolid"/>
                <icon :icon="sharedIcon" font="solid"/>
            </div>
            <div class="action-icon">
                <icon v-if="password.getProperty('editable')" :icon="actionIcon" @click="toggleAction()" :class="actionClassList"/>
            </div>
        </div>
        <property :editable="editable" :field="field" v-for="field in defaultFields" :key="field" v-on:updateField="updateField" v-on:error="handleValidationError"/>
        <label v-if="customFields.length > 1" class="custom-fields">{{customFieldsLabel}}</label>
        <custom-property :field="field" :editable="editable" v-for="field in customFields" :key="field" v-on:updateField="updateCustomField" v-on:error="handleValidationError" :maxLength="customFieldLength"/>
    </div>
</template>

<script>
    import Icon from "@vue/Components/Icon";
    import Password from "passwords-client/src/Model/Password/Password";
    import Property from '@vue/Components/Password/Property';
    import CustomProperty from '@vue/Components/Password/CustomProperty';
    import MessageService from "@js/Services/MessageService";
    import LocalisationService from '@js/Services/LocalisationService';
    
    export default {
        components: {Icon, Property, CustomProperty},
        props     : {
            password: {
                type: Password
            }
        },

        data() {
            return {
                editable         : false,
                defaultFields    : this.getDefaultFields(),
                customFields     : this.getCustomFields(),
                updatedFields    : {},
                errorQueue       : [],
                customFieldLength: 8192
            }
        },

        computed: {
            securityClass() {
                let types = ['secure', 'warn', 'bad'];

                return `security ${types[this.password.getStatus()]}`;
            },
            favoriteIconSolid() {
                if(this.password.getProperty('favorite') === true) {
                    return "solid";
                }
                return "reqular";
            },
            sharedIcon() {
                if(this.password.getProperty('shared') === true) {
                    return "users";
                }
                return "user-shield";
            },
            showNewCustomField() {
                if(this.allowNewCustomField()) {
                    return true;
                }
                return false;
            },
            actionClassList() {
                return this.editable === true && this.errorQueue.length > 0 ? "action-icon disabled":"action-icon";
            },
            actionIcon() {
                return this.editable ? "save":"edit";
            },
            customFieldsLabel() {
                return LocalisationService.translate(`LabelCustomFields`);
            }
        },

        methods   : {
            getDefaultFields() {
                var fields = [];
                for (var property in this.password.getProperties()) {
                    if(property === "password") {
                        fields.push(this.getFieldObject(property, "password", true, true, 256));
                    }
                    if(property === "edited" || property === "created") {
                        fields.push(this.getFieldObject(property, "datetime", false, false, undefined));
                    }
                    if(property === "label") {
                        fields.push(this.getFieldObject(property, "text", true, false, 64));
                    } 
                    if(property === "folder") {
                        fields.push(this.getFieldObject(property, "folder", false, false, undefined));
                    }
                    if(property === "notes") {
                        fields.push(this.getFieldObject(property, "textarea", true, true, 4096));
                    } 
                    if(property === "url") {
                        fields.push(this.getFieldObject(property, "url", true, true, 2048));
                    }
                    if(property === "username") {
                        fields.push(this.getFieldObject(property, "text", true, true, 64));
                    }
                    if(property === "hidden") {
                        fields.push(this.getFieldObject(property, "checkbox", true, false, undefined));
                    }
                }
                return fields;
            },
            getFieldObject(property, type, editable, allowCopy, maxLength) {
                return {
                    name     : property,
                    type     : type,
                    value    : this.password.getProperty(property),
                    editable : editable,
                    allowCopy: allowCopy,
                    maxLength: maxLength
                }
            },
            getCustomFields() {
                var result = this.password.getProperty('customFields');
                result.push(this.getNewCustomField());
                this.customFieldLength = 8192 - JSON.stringify(result).length;
                return result;
            },
            getNewCustomField() {
               return (
                    {
                        label : "",
                        value : "",
                        type  : "text"
                    }
                )
            },
            allowNewCustomField() {
                if(this.customFields === undefined 
                    || this.customFields.length >= 20) return false;
                if(this.updatedFields !== undefined 
                    && this.updatedFields.customFields !== undefined 
                    && this.updatedFields.customFields.length >=20) return false;
                return true;
            },
            async updateFavorite() {
                var data = {
                    id: this.password.getId(),
                    favorite: !this.password.getFavorite()
                }
                var result = await MessageService.send({type: 'password.update', payload: {data: data}});
                if(result.getPayload().success === true) {
                    this.password.setProperties(result.getPayload().data);
                }
            },
            toggleAction() {
                if(this.errorQueue.length > 0) return;
                if(this.editable === true) {
                    this.save();
                }
                this.editable = !this.editable;
            },
            save() {
                if(Object.keys(this.updatedFields).length !== 0) {
                    this.removeEmptyCustomFields();
                    this.updatedFields.id = this.password.getId();
                    MessageService.send({type: 'password.update', payload: {data: this.updatedFields}});
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
                var emptyFieldAvailable = false;
                this.updatedFields.customFields.forEach((e) => {
                    if(e.label === "" && e.value === "" && e.type !== "data" && e.type !== "file") {
                            emptyFieldAvailable = true;
                        }
                })
                if(!emptyFieldAvailable) {
                    this.customFields.push(this.getNewCustomField());
                }
            },
            removeEmptyCustomFields(){
                if(this.updatedFields.customFields === undefined) return;
                this.updatedFields.customFields.forEach((e) => {
                    if(e.label === "" && e.value === "" && e.type !== "data" && e.type !== "file") {
                        var i = this.updatedFields.customFields.indexOf(e)
                        this.updatedFields.customFields.splice(i, 1);
                    }
                })
            },
            handleValidationError(field, error) {
                if(this.errorQueue.indexOf(field) !== -1) {
                    if(error === false) {
                        this.errorQueue.splice(this.errorQueue.indexOf(field), 1);
                    }
                } else {
                    if(error === true) {
                        this.errorQueue.push(field)
                    }
                }
            }
        }
    };
</script>

<style lang="scss">
.item-menu.password-view {
    background-color : var(--element-hover-bg-color);
    color            : var(--element-hover-fg-color);

    .icon {
        text-align : center;
        width      : 3rem;
        display    : inline-block;
    }

    .password-header {
        line-height    : 3rem;
        display        : flex;
        justify-content: space-between;
        margin-bottom  : -1rem;

        .left-space, .action-icon {
            width       : 3rem
        }

        .badge-container {
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
                cursor    : pointer;
                color     : var(--warning-bg-color);
                font-size : calc(var(--font-size) + 1rem);
                position  : relative;
                bottom    : -.25rem;
            }
        }

        .action-icon {

            &.icon.disabled {
                opacity   : .5;
                
                &:hover {
                    cursor           : initial;
                    background-color : initial;
                    color            : initial;
                }
            }

            &.icon:hover {
                cursor           : pointer;
                background-color : var(--button-hover-bg-color);
                color            : var(--button-hover-fg-color);
            }
        }
    }

    label.custom-fields {
        display           : block;
        font-weight       : 550;
        line-height       : 1rem;;
        padding-left      : .5rem;
        padding-bottom    : .25rem;
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
        outline: none;
    }
    
    a {
        width            : 100%;
        padding          : .25rem;
        line-height      : 2rem;
        background-color : var(--element-hover-bg-color);
        color            : var(--element-active-fg-color);
    }

}
</style>