<template>
    <ul class="list folder-list">
        <folder v-for="folder in folders" :folder="folder" :key="folder.getId()" v-on:open="$emit('open', $event)"/>
    </ul>
</template>

<script>
    import Folder from '@vue/Components/List/Item/Folder';

    export default {
        components: {Folder},
        props     : {
            folders: {
                type   : Array,
                default: []
            }
        }
    };
</script>

<style lang="scss">
    .list.folder-list {
        list-style : none;
        padding    : 0;
        margin     : 0;
    }
</style>