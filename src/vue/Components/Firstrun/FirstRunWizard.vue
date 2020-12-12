<template>
    <div class="first-run-wizard">
        <div class="first-run-wizard-content">
            <server-setup/>
        </div>
    </div>
</template>

<script>
    import ServerSetup from '@vue/Components/Firstrun/Steps/ServerSetup';

    export default {
        components: {ServerSetup}
    };
</script>

<style lang="scss">
.first-run-wizard {
    position : fixed;
    top      : 0;
    left     : 0;
    bottom   : 0;
    right    : 0;

    &:before {
        content          : " ";
        background-color : var(--element-bg-color);
        position         : fixed;
        top              : 0;
        left             : 0;
        bottom           : 0;
        right            : 0;
        opacity          : .75;
        z-index          : -1
    }

    .first-run-wizard-content {
        margin           : 1rem;
        width            : calc(100% - 2rem);
        height           : calc(100% - 2rem);
        background-color : var(--element-active-hover-fg-color);
        color            : var(--element-active-hover-bg-color);
        background-image : url("/img/background.png"), linear-gradient(40deg, #0082c9 0%, #30b6ff 100%);
        background-size  : 300px, cover;
        border-radius    : var(--element-border-radius);
        padding          : .5rem;
        box-sizing       : border-box;
        position         : relative;
    }
}
</style>