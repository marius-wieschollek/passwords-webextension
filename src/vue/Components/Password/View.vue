<template>
    <div class="item-menu password-view">
        <div class="password-header">
            <div class="left-space"/>
            <div class="badge-container">
                <icon :class="securityClass" icon="shield-alt" font="solid"/>
                <icon class="favorite" @click="updateFavorite()" icon="star" :font="favoriteIconSolid"/>
                <icon :icon="sharedIcon" font="solid"/>
            </div>
            <div class="action-container">
                <icon icon="save" @click="save()" v-if="editable"/>
                <icon icon="edit" @click="editable = !editable" v-if="!editable"/>
            </div>
        </div>
        <div class="password-view-item">
            <property :password="password" :editable="editable" :field="field" v-for="field in defaultFields" :key="field" v-on:updateField="updateField"/>
            <custom-property :field="field" :editable="editable" v-for="field in customFields" :key="field" v-on:updateField="updateCustomField"/>
        </div>
    </div>
</template>

<script>
    import Icon from "@vue/Components/Icon";
    import Password from "passwords-client/src/Model/Password/Password";
    import Property from '@vue/Components/Password/Property';
    import CustomProperty from '@vue/Components/Password/CustomProperty';
    import MessageService from "@js/Services/MessageService";
    
    export default {
        components: {Icon, Property, CustomProperty},
        props     : {
            password: {
                type: Password
            }
        },

        data() {
            return {
                editable      : false,
                defaultFields : this.getDefaultFields(),
                customFields  : this.getCustomFields(),
                updatedFields : {}
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
            }
        },

        methods   : {
            getDefaultFields() {
                var fields = [];
                for (var property in this.password.getProperties()) {
                    if(property === "password") {
                        fields.push(this.getFieldObject(property, "password", true, true));
                    }
                    if(property === "edited" || property === "created") {
                        fields.push(this.getFieldObject(property, "datetime", false, false));
                    }
                    if(property === "label") {
                        fields.push(this.getFieldObject(property, "text", true, false));
                    } 
                    if(property === "folder") {
                        fields.push(this.getFieldObject(property, "folder", false, false));
                    }
                    if(property === "notes") {
                        fields.push(this.getFieldObject(property, "textarea", true, true));
                    } 
                    if(property === "url") {
                        fields.push(this.getFieldObject(property, "url", true, true));
                    }
                    if(property === "username") {
                        fields.push(this.getFieldObject(property, "text", true, true));
                    }
                    if(property === "hidden") {
                        fields.push(this.getFieldObject(property, "checkbox", true, false));
                    }
                }
                return fields;
            },
            getFieldObject(property, type, editable, allowCopy) {
                return {
                    name: property,
                    type: type,
                    editable: editable,
                    allowCopy: allowCopy,
                }
            },
            getCustomFields() {
                var result = this.password.getProperty('customFields');
                result.push(this.getNewCustomField());
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
            save() {
                if(Object.keys(this.updatedFields).length !== 0) {
                    this.removeEmptyCustomFields();
                    this.updatedFields.id = this.password.getId();
                    MessageService.send({type: 'password.update', payload: {data: this.updatedFields}});
                    this.updatedFields = {};
                }
                this.editable = false;
            },
            updateField(field, value) {
                this.updatedFields[field] = value;
            },
            updateCustomField() {
                this.updatedFields.customFields = this.customFields;
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
            }
        }
    };
</script>

<style lang="scss">
.item-menu.password-view {
    background-color : var(--element-hover-bg-color);
    color            : var(--element-hover-fg-color);

    .password-header {
        line-height    : 3rem;
        display        : flex;
        justify-content: space-between;
        margin-bottom  : -1rem;

        .left-space{
            width      : 3rem
        }
        .icon {
            width      : 3rem;
            display    : inline-block;
            text-align : center;
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
                font-size :calc(var(--font-size) + 1rem);
                position  : relative;
                bottom    : -.25rem;
            }
        }

        .action-container {
            cursor      : pointer;
            
            .icon:hover {
                background-color : var(--button-hover-bg-color);
                color            : var(--button-hover-fg-color);
            }
        }
    }
    

    .view-item {
        line-height : 3rem;
        cursor      : pointer;
        display     : flex;

        .icon {
            text-align : center;
            width      : 3rem;
            display    : inline-block;
        }

        &:hover {
            background-color : var(--element-active-hover-bg-color);
            color            : var(--element-active-hover-fg-color);
        }
    }
}
</style>