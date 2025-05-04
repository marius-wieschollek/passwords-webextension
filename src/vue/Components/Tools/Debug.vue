<template>
    <button-field class="debug-highlight" value="DebugHighlightLoginForms" @click="showDebugFields">
        <icon slot="before" icon="highlighter" font="solid"/>
    </button-field>
</template>

<script>
    import MessageService from "@js/Services/MessageService";
    import ButtonField from "@vue/Components/Form/ButtonField";
    import Icon from "@vue/Components/Icon";

    export default {
        components: {Icon, ButtonField},
        methods   : {
            showDebugFields() {
                MessageService.send('popup.debug.form.fields');
            }
        }
    };
</script>

<style lang="scss">
button.debug-highlight {
    background-color : var(--element-active-bg-color);
    color            : var(--element-active-fg-color);
    text-align       : center;
    width            : calc(100% - 1rem);
    line-height      : 3rem;
    border-radius    : var(--button-border-radius);
    border           : none;
    margin           : .5rem;
    cursor           : pointer;

    &:hover {
        background-color : var(--element-active-hover-bg-color);
        color            : var(--element-active-hover-fg-color);
    }

    .icon {
        margin-right : .5rem;
    }
}
</style>