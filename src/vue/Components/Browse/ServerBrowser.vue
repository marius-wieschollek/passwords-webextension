<template>
    <div class="browse-container">
        <parent-folder :folder="folderId" v-on:open="open($event)" v-if="!isHomeFolder" />
        <folder-list :folders="folders" v-on:open="open($event)"/>
        <password-list :passwords="passwords" :favicons="true"/>
        <translate tag="div" class="no-results" say="NoServerItems" v-if="passwords.length === 0 && folders.length === 0" />
    </div>
</template>

<script>
    import Server from '@js/Models/Server/Server';
    import MessageService from '@js/Services/MessageService';
    import PasswordList from '@vue/Components/List/PasswordList';
    import FolderList from '@vue/Components/List/FolderList';
    import Folder from '@vue/Components/List/Item/Folder';
    import ParentFolder from '@vue/Components/List/Item/ParentFolder';
    import Translate from '@vue/Components/Translate';

    export default {
        components: {Translate, ParentFolder, Folder, FolderList, PasswordList},
        props     : {
            server: {
                type: Server
            }
        },

        data() {
            return {
                folderId : '00000000-0000-0000-0000-000000000000',
                passwords: [],
                folders  : [],
                timer    : null
            };
        },

        mounted() {
            this.loadFolders();
        },

        destroyed() {
            clearTimeout(this.timer);
        },

        computed: {
            isHomeFolder() {
                return this.folderId === '00000000-0000-0000-0000-000000000000';
            }
        },

        methods: {
            loadFolders() {
                clearTimeout(this.timer);
                MessageService
                    .send({type: 'folder.list', payload: {server: this.server.getId(), folder: this.folderId}})
                    .then((reply) => {
                        let payload = reply.getPayload();
                        this.folders = payload.folders;
                        this.passwords = payload.passwords;
                        this.timer = setTimeout(() => this.loadFolders(), 5000);
                    });
            },
            open(folder) {
                this.folderId = folder.getId();
            }
        },

        watch: {
            folderId() {
                this.loadFolders();
            }
        }
    };
</script>

<style lang="scss">
    .browse-container {
        .no-results {
            line-height : 3rem;
            text-align  : center;
        }
    }
</style>