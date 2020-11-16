<template>
    <span :class="iconName"
          :title="getTitle"
          @click="fireEvent($event)"
          @dblclick="fireEvent($event)"
          @dragstart="fireEvent($event)"
          v-on:mouseenter="hoverOn()"
          v-on:mouseleave="hoverOff()">
    </span>
</template>

<script>
    import LocalisationService from '@js/Services/LocalisationService';

    export default {
        props: {
            icon     : {
                type: String
            },
            font     : {
                type   : String,
                default: 'regular'
            },
            hoverIcon: {
                type   : String,
                default: null
            },
            hoverFont: {
                type   : String,
                default: null
            },
            spin     : {
                type   : Boolean,
                default: false
            },
            title    : {
                type   : String,
                default: null
            }
        },

        data() {
            return {
                hover: false
            };
        },

        computed: {
            iconName() {
                let icon  = this.hover && this.hoverIcon !== null ? this.hoverIcon:this.icon,
                    font  = this.hover && this.hoverFont !== null ? this.hoverFont:this.font,
                    style = font === 'solid' ? 'fas':'far';

                if(this.spin) style += ' fa-spin';

                return `icon icon-${icon} font-${font} ${style} fa-${icon}`;
            },
            getTitle() {
                if(!this.title) return;

                return LocalisationService.translate(this.title);
            }
        },

        methods: {
            hoverOn() {
                this.hover = true;
            },
            hoverOff() {
                this.hover = false;
            },
            fireEvent($event) {
                this.$emit($event.type, $event);
            }
        }
    };
</script>

<style lang="scss">
    $fa-font-path : "~@fortawesome/fontawesome-free/webfonts";
    @import "~@fortawesome/fontawesome-free/scss/regular";
    @import "~@fortawesome/fontawesome-free/scss/solid";
    @import "~@fortawesome/fontawesome-free/scss/icons";
    @import "~@fortawesome/fontawesome-free/scss/animated";

    .icon {
        min-width  : 1em;
        box-sizing : content-box;
    }
</style>