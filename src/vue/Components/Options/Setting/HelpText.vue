<template>
    <div class="settings-help-text" :class="{open:open}" @click.stop="toggleHelp">
        <icon :icon="icon" font="solid"/>
        <div class="text">
            <translate lang="de" :say="text"/>
        </div>
    </div>
</template>

<script>
    import Icon from "@vue/Components/Icon";
    import Translate from "@vue/Components/Translate";

    export default {
        name      : "HelpText",
        components: {Translate, Icon},
        props     : {
            type: {
                type   : String,
                default: 'info'
            },
            text: {
                type   : String,
                default: ''
            }
        },
        data() {
            return {
                open: false
            };
        },
        computed: {
            icon() {
                if(this.type === 'warning') return 'exclamation-triangle';
                return 'info-circle';
            }
        },
        methods : {
            toggleHelp() {
                this.open = !this.open;

                if(this.open) {
                    document.addEventListener('click', () => {this.open = false;}, {once: true, passive: true});
                }
            }
        }
    };
</script>

<style lang="scss">
.settings-help-text {
    position         : relative;
    background-color : var(--button-bg-color);
    color            : var(--button-fg-color);
    transition       : var(--button-transition), z-index 0s ease-in-out .25s;
    z-index          : 1;

    &.open,
    &:hover {
        background-color : var(--button-hover-bg-color);
        color            : var(--button-hover-fg-color);
        transition       : var(--button-transition);
        z-index          : 2;

        .text {
            background-color : var(--button-hover-bg-color);
            color            : var(--button-hover-fg-color);
            max-height       : 12rem;
            transition       : max-height .25s ease-in-out;
        }

        .icon-info-circle {
            color : var(--button-hover-fg-color);
        }
    }

    .icon {
        padding : .5rem;
        display : block;
        cursor  : pointer;
        color   : var(--info-bg-color);
    }

    .icon-exclamation-triangle {
        color : var(--warning-bg-color);
    }

    .text {
        position   : absolute;
        width      : 12rem;
        right      : 0;
        top        : 100%;
        overflow   : hidden;
        max-height : 0;
        transition : background-color 0s .25s linear, color 0s .25s linear, max-height .25s ease-in-out;

        span {
            padding         : .5rem;
            display         : block;
            text-align      : justify;
            -webkit-hyphens : auto;
            -moz-hyphens    : auto;
            -ms-hyphens     : auto;
            hyphens         : auto;
        }
    }
}
</style>