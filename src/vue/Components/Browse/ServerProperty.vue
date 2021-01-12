<template>
    <div class="server-property">
        <translate :say="label"/>
        <span>{{value}}</span>
    </div>
</template>

<script>
    import Translate from '@vue/Components/Translate';

    export default {
        components: {Translate},
        props     : {
            property: {
                type: String
            },
            value   : {
                type: [String, Number]
            }
        },

        computed: {
            label() {
                return `Label${this.property.capitalize()}`;
            }
        }
    };
</script>

<style lang="scss">
    .server-property {
        display               : grid;
        grid-template-columns : 3fr 7fr;
        grid-row-gap          : .25rem;
        padding               : 0 .25rem;

        a,
        span {
            padding : .5rem .25rem;
        }

        a {
            color           : var(--element-active-fg-color);
            text-decoration : none;

            &:hover,
            &:active {
                text-decoration : underline;
            }
        }
    }
</style>