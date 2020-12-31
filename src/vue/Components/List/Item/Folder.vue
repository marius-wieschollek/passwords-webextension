<template>
    <li class="item folder-item">
        <div class="label" @click="openFolder()" :title="folder.getId()">
            <icon icon="folder" font="solid"/>{{folder.getLabel()}}
        </div>
    </li>
</template>

<script>
    import Folder from 'passwords-client/src/Model/Folder/Folder';
    import Icon from '@vue/Components/Icon';

    export default {
        components: {Icon},
        props     : {
            folder: {
                type: Folder
            }
        },
        methods   : {
            openFolder() {
                this.$emit('open', this.folder);
            }
        }
    };
</script>

<style lang="scss">
    .item.folder-item {
        line-height : 3rem;
        font-size   : 1rem;
        background-color : var(--element-bg-color);
        color            : var(--element-fg-color);
        cursor      : pointer;
        overflow    : hidden;


        > .label {
            padding     : 0 .5rem 0 0;
            min-width   : 100vw;
            white-space : nowrap;

            .icon {
                padding : .75rem;
            }
        }

        &:hover {
            background-color : var(--element-hover-bg-color);
            color            : var(--element-hover-fg-color);

            > .label {
                flex-shrink : 1;
                min-width   : 50vw;
            }
        }
    }
</style>