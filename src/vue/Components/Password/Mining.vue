<template>
    <div class="item-menu password-mining">
        <translate say="MiningItemIsNew" class="create-info" v-if="item.isNew()">
            <icon slot="before" icon="info-circle" font="solid"/>
        </translate>
        <translate say="MiningItemIsUpdate" class="create-info" :variables="updateVariables" v-else>
            <icon slot="before" icon="info-circle" font="solid"/>
        </translate>
        
        <property :password="password" :editable="editable" :field="field" v-for="field in defaultFields" :key="field" v-on:updateField="updateField" v-on:error="handleValidationError"/>
        <label class="custom-fields">{{customFieldsLabel}}</label>
        <custom-property :field="field" :editable="editable" v-for="field in customFields" :key="field" v-on:updateField="updateCustomField" v-on:error="handleValidationError" :maxLength="customFieldLength"/>
    </div>
</template>

<script>
    import Icon from "@vue/Components/Icon";
    import MiningItem from '@js/Models/Queue/MiningItem';
    import Property from '@vue/Components/Password/Property';
    import CustomProperty from '@vue/Components/Password/CustomProperty';
    import Translate from '@vue/Components/Translate';
    import LocalisationService from '@js/Services/LocalisationService';
    import MessageService from '@js/Services/MessageService';
    
    export default {
        components: {Icon, Translate, Property, CustomProperty},
        props     : {
            item: {
                type: MiningItem
            }
        },

        data() {
            return {
                editable         : true,
                defaultFields    : this.getDefaultFields(),
                customFields     : this.getCustomFields(),
                updatedFields    : {},
                errorQueue       : [],
                customFieldLength: 8192
            }
        },

        computed: {
            updateVariables() {
                return [
                    this.item.getTask().fields.label
                ];
            },
            showNewCustomField() {
                if(this.allowNewCustomField()) {
                    return true;
                }
                return false;
            },
            customFieldsLabel() {
                return LocalisationService.translate(`LabelCustomFields`);
            }
        },

        methods   : {
            getDefaultFields() {
                var fields = [];
                this.item.listResultFields().forEach((property) => {
                    if(property === "password") {
                        fields.push(this.getFieldObject(property, "password", true, true, 256));
                    }
                    if(property === "label") {
                        fields.push(this.getFieldObject(property, "text", true, false, 64));
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
                })
                return fields;
            },
            getFieldObject(property, type, editable, allowCopy, maxLength) {
                return {
                    name     : property,
                    type     : type,
                    value    : this.item.getResultField(property),
                    editable : editable,
                    allowCopy: allowCopy,
                    maxLength: maxLength
                }
            },
            getCustomFields() {
                var result = this.item.getResultField('customFields');
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
                var allowNew = true;
                this.customFields.forEach((e) => {
                    if(e.label === "" && e.value === "" && e.type !== "data" && e.type !== "file") {
                            allowNew = false;
                        }
                })
                
                return allowNew;
            },
            updateField(field, value) {
                this.item.setResultField(field, value)
                this.update();
            },
            updateCustomField() {
                this.item.setResultField('customFields', this.customFields)
                this.update();
                this.customFieldLength = 8192 - JSON.stringify(this.customFields).length;
                if(this.allowNewCustomField()) {
                    this.customFields.push(this.getNewCustomField());
                }
            },
            update() {
                MessageService
                        .send({type: 'popup.mining.update', payload: this.item});
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
.item-menu.password-mining {
    background-color : var(--element-hover-bg-color);
    color            : var(--element-hover-fg-color);

    .create-info {
        display : block;
        padding : 1rem .5rem .25rem .5rem;
        color   : var(--element-active-fg-color);
    }

    .icon {
        text-align : center;
        width      : 3rem;
        display    : inline-block;
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