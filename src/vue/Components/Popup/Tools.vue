<template>
    <div class="tools-container">
        <foldout :tabs="tabs" :initial-open="true" ref="foldout">
            <generate slot="generate"/>
            <debug slot="debug"/>
        </foldout>
        <translate class="tools-settings-link" say="OpenSettings" @click="openSettings">
            <icon slot="before" icon="cogs" font="solid"/>
        </translate>
    </div>
</template>

<script>
    import Translate from "@vue/Components/Translate";
    import Icon from "@vue/Components/Icon";
    import MessageService from "@js/Services/MessageService";
    import Foldout from "@vue/Components/Foldout";
    import Debug from "@vue/Components/Tools/Debug";
    import Generate from "@vue/Components/Tools/Generate";

    export default {
        components: {Generate, Debug, Foldout, Icon, Translate},

        computed: {
            tabs() {
                return {
                    generate: {
                        icon    : 'key',
                        iconFont: 'solid',
                        label   : 'ToolsTabGeneratePassword'
                    },
                    debug   : {
                        icon    : 'bug',
                        iconFont: 'solid',
                        label   : 'ToolsTabDebugTools'
                    }
                };
            }
        },
        methods : {
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