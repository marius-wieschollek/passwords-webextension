<template>
    <div>
        <ul>
            <li v-for="folder in folders" :key="folder.getId()" @click="open(folder)">{{folder.getLabel()}}</li>
        </ul>
        <password-list :passwords="passwords"/>
    </div>
</template>

<script>
    import Server from '@js/Models/Server/Server';
    import MessageService from '@js/Services/MessageService';
    import PasswordList from '@vue/Components/List/PasswordList';

    export default {
        components: {PasswordList},
        props     : {
            server: {
                type: Server
            }
        },

        data() {
            return {
                folder   : '00000000-0000-0000-0000-000000000000',
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
                    .send({type: 'folder.list', payload: {server: this.server.getId(), folder: this.folder}})
                    .then((reply) => {
                        let payload = reply.getPayload();
                        this.folders = payload.folders;
                        this.passwords = payload.passwords;
                    });
            },
            open(folder) {
                this.folder = folder.getId();
            }
        },

        watch: {
            folder() {
                this.loadFolders();
            }
        }
    };
</script>

<style scoped>

</style>