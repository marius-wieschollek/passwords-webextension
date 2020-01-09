<template>
    <span :class="iconName" @click="fireEvent($event)" @dblclick="fireEvent($event)">
    </span>
</template>

<script>
    export default {
        props: {
            icon: {
                type: String
            },
            font: {
                type: String,
                default: 'regular'
            },
            spin: {
                type: Boolean,
                default: false
            }
        },

        computed: {
            iconName() {
                let style = this.font === 'solid' ? 'fas':'far';

                if(this.spin) {
                    style += ' fa-spin'
                }

                return `icon ${style} fa-${this.icon}`
            }
        },

        methods: {
            fireEvent($event) {
                this.$emit($event.type, $event)
            }
        }
    }
</script>

<style lang="scss">
    $fa-font-path : "~@fortawesome/fontawesome-free/webfonts";
    @import "~@fortawesome/fontawesome-free/scss/regular";
    @import "~@fortawesome/fontawesome-free/scss/solid";
    @import "~@fortawesome/fontawesome-free/scss/icons";
    @import "~@fortawesome/fontawesome-free/scss/animated";
</style>