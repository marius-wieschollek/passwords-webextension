<template>
    <component :is="tag" @click="fireEvent($event)">
        <slot name="before"/>
        {{ text }}
        <slot name="default" v-if="say"/>
        <slot name="after"/>
    </component>
</template>

<script>
    import LocalisationService from '@js/Services/LocalisationService';

    export default {
        props: {
            say      : {
                type     : String,
                'default': null
            },
            variables: {
                type     : Array,
                'default': () => { return []; }
            },
            tag      : {
                type     : String,
                'default': 'span'
            }
        },

        computed: {
            text() {
                if(this.say) {
                    return LocalisationService.translate(this.say, this.variables);
                }
                if(this.$slots.default) {
                    return LocalisationService.translate(this.$slots.default[0].text.trim(), this.variables);
                }
                return '';
            }
        },
        methods : {
            fireEvent($event) {
                this.$emit($event.type, $event);
            }
        }
    };
</script>