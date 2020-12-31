<template>
    <div class="server-property">
        <translate :say="label"/>
        <a :href="value" target="_blank" rel="noopener noreferrer">{{value}}</a>
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
                type: String
            }
        },

        computed: {
            label() {
                return `Label${this.property.capitalize()}`;
            }
        }
    };
</script>