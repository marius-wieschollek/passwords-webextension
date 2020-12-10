<template>
    <div class="tools-container">
        <translate tag="h4" say="ToolsGeneratePassword" />
        <translate class="tools-settings-link" say="OpenSettings" @click="openSettings">
            <icon slot="before" icon="cogs" font="solid"/>
        </translate>
    </div>
</template>

<script>
    import Translate from "@vue/Components/Translate";
    import Icon from "@vue/Components/Icon";
    import MessageService from "@js/Services/MessageService";

    export default {
        components: {Icon, Translate},
        methods   : {
            openSettings() {
                MessageService.send('popup.settings.open');
                window.close();
            }
        }
    };
</script>

<style lang="scss">
.tools-container {
    .tools-settings-link {
        position         : fixed;
        bottom           : 0;
        padding          : 1rem;
        width            : 100%;
        border-top       : 1px solid var(--element-active-fg-color);
        background-color : var(--element-active-bg-color);
        color            : var(--element-active-hover-fg-color);
        cursor           : pointer;
        transition       : var(--element-transition);

        &:hover {
            background-color : var(--element-active-hover-bg-color);
        }

        .icon {
            margin-right : .5rem;
        }
    }
}
</style>