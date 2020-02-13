<template>
    <div>
        <folder-list :folders="folders" v-on:open="open($event)"/>
        <password-list :passwords="passwords"/>
    </div>
</template>

<script>
    import Server from '@js/Models/Server/Server';
    import MessageService from '@js/Services/MessageService';
    import PasswordList from '@vue/Components/List/PasswordList';
    import FolderList from '@vue/Components/List/FolderList';
    import Folder from '@vue/Components/List/Item/Folder';

    export default {
        components: {Folder, FolderList, PasswordList},
        props     : {
            server: {
                type: Server
            }
        },

        data() {
            return {
                folderId : '00000000-0000-0000-0000-000000000000',
                folder   : null,
                passwords: [],
                folders  : []
            };
        },

        mounted() {
            this.loadFolders();
        },

        methods: {
            loadFolders() {
                MessageService
                    .send({type: 'folder.list', payload: {server: this.server.getId(), folder: this.folderId}})
                    .then((reply) => {
                        let payload = reply.getPayload();
                        this.folders = payload.folders;
                        this.passwords = payload.passwords;
                    });
            },
            open(folder) {
                this.folderId = folder.getId();
                this.folder = folder;
            }
        },

        watch: {
            folderId() {
                this.loadFolders();
            }
        }
    };
</script>

<style scoped>

</style>