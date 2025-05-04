<template>
    <div class="theme-options">
        <a :href="downloadContent" :download="fileName">
            <button-field variant="secondary" :wide="true" title="ThemeExportTitle" value="ThemeExportButton">
                <icon slot="before" icon="file-export" font="solid"/>
            </button-field>
        </a>
        <button-field variant="secondary" :wide="true" title="ThemeImportTitle" value="ThemeImportButton" @click="triggerUpload">
            <icon slot="before" icon="file-import" font="solid"/>
        </button-field>
        <button-field variant="secondary" :wide="true" title="ThemeDeleteTitle" value="ThemeDeleteButton" @click="deleteTheme" v-if="canDelete">
            <icon slot="before" icon="trash" font="solid"/>
        </button-field>
        <input class="file-upload" type="file" ref="upload" accept="application/json" @change="uploadTheme"/>
    </div>
</template>

<script>
    import Theme from "@js/Models/Theme/Theme";
    import ButtonField from "@vue/Components/Form/ButtonField.vue";
    import MessageService from "@js/Services/MessageService";
    import ErrorManager from "@js/Manager/ErrorManager";
    import Icon from "@vue/Components/Icon.vue";
    import ToastService from "@js/Services/ToastService";

    export default {
        components: {Icon, ButtonField},

        props: {
            theme: Theme
        },

        computed: {
            fileName() {
                return this.theme.getId() + '.json';
            },
            downloadContent() {
                return 'data:application/json;base64,' + btoa(JSON.stringify(this.theme, null, 2));
            },
            canDelete() {
                return this.theme.getType() === 'custom';
            }
        },
        methods : {
            triggerUpload() {
                this.$refs.upload.click();
            },
            uploadTheme() {
                let file   = this.$refs.upload.files[0],
                    reader = new FileReader();
                reader.onload = (event) => {
                    let payload = JSON.parse(event.target.result);
                    MessageService
                        .send({type: 'theme.import', payload})
                        .then((message) => {
                            let payload = message.getPayload();

                            if(payload.success) {
                                this.$emit('update');
                                ToastService.success('ThemeImportSuccess');
                            } else {
                                ToastService.error(payload.message);
                            }
                        });
                };
                reader.onerror = (event) => {
                    ErrorManager.error(event);
                };
                reader.readAsText(file);
            },
            async deleteTheme() {
                if(!this.canDelete || !await this.confirmDelete()) {
                    return;
                }

                let message = await MessageService.send(
                    {
                        type   : 'theme.delete',
                        payload: {id: this.theme.getId()}
                    }
                );
                if(message.getPayload().success) {
                    ToastService.success('ThemeDeleted')
                                .catch(ErrorManager.catch);
                }

                this.$emit('update');
            },
            async confirmDelete() {
                let confirm = await ToastService.create(
                    {
                        type     : 'info',
                        title    : null,
                        message  : ['ThemeDeleteConfirm', [this.theme.getLabel()]],
                        closeable: false,
                        ttl      : 0,
                        options  : {yes: 'ButtonYes', no: 'ButtonNo'},
                        modal    : true
                    }
                );

                return confirm === 'yes';
            }
        }
    };
</script>

<style lang="scss">
.theme-options {
    display        : flex;
    flex-direction : column;
    gap            : .25rem;

    .file-upload {
        display : none;
    }
}
</style>