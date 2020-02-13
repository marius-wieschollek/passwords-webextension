<template>
    <div class="item folder-item parent-item" v-if="model" @click="open()">
        <div class="label">
            <icon icon="folder-open" font="solid"/>{{model.getLabel()}}
        </div>
    </div>
</template>

<script>

    import MessageService from '@js/Services/MessageService';
    import Icon from '@vue/Components/Icon';

    export default {
        components: {Icon},
        props     : {
            folder: {
                type   : String,
                default: null
            }
        },

        data() {
            return {
                model : null,
                parent: null
            };
        },

        mounted() {
            this.loadFolder();
        },

        methods: {
            async loadFolder() {
                this.model = null;
                if(this.folder === null) return;

                let reply  = await MessageService.send({type: 'folder.show', payload: this.folder}),
                    /** @type {Folder} **/
                    folder = reply.getPayload();

                if(folder === null || folder.getId() !== this.folder) return;
                this.model = folder;

                reply = await MessageService.send({type: 'folder.show', payload: folder.getParent()});
                this.parent = reply.getPayload();
            },
            open() {
                if(this.parent !== null) this.$emit('open', this.parent);
            }
        },

        watch: {
            folder() {
                this.loadFolder();
            }
        }
    };
</script>

<style lang="scss">
    .item.parent-item,
    .item.parent-item:hover {
        color       : var(--content-primary-text-color);
        font-weight : bold;
    }
</style>