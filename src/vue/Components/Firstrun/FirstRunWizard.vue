<template>
    <div class="first-run-wizard" :class="cssClass">
        <div class="first-run-wizard-content">
            <server-setup v-if="stage === 1"/>
            <common-settings v-if="stage === 2" v-on:complete="stage++"/>
            <setup-complete v-if="stage === 3" v-on:close="close"/>
        </div>
    </div>
</template>

<script>
    import ServerSetup from '@vue/Components/Firstrun/Steps/ServerSetup';
    import PopupStateService from "@js/Services/PopupStateService";
    import CommonSettings from "@vue/Components/Firstrun/Steps/CommonSettings.vue";
    import SetupComplete from "@vue/Components/Firstrun/Steps/SetupComplete.vue";

    export default {
        components: {SetupComplete, CommonSettings, ServerSetup},
        data() {
            return {
                stage   : PopupStateService.getStatus('firstRun'),
                cssClass: ''
            };
        },
        methods: {
            close() {
                this.cssClass = 'close';
                setTimeout(
                    () => {this.$emit('close');},
                    750
                );
            }
        },
        watch: {
            stage(stage) {
                console.log(stage);
            }
        }
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
        z-index          : -1;
        transition       : opacity .5s ease-in-out .25s;
    }

    .first-run-wizard-content {
        margin           : 1rem;
        width            : calc(100% - 2rem);
        height           : calc(100% - 2rem);
        background-color : var(--element-active-hover-fg-color);
        color            : var(--element-active-hover-bg-color);
        background-image : url("@/platform/generic/img/background.png"), linear-gradient(40deg, #0082c9 0%, #30b6ff 100%);
        background-size  : contain;
        border-radius    : var(--element-border-radius);
        padding          : .5rem;
        box-sizing       : border-box;
        position         : relative;
        top              : 0;
        transition       : top .5s ease-in-out;
    }

    &.close {
        &:before {
            opacity : 0;
        }

        .first-run-wizard-content {
            top : 100%
        }
    }
}

body.mobile {
    .first-run-wizard {
        .first-run-wizard-content {
            padding : 1rem;
        }
    }
}
</style>