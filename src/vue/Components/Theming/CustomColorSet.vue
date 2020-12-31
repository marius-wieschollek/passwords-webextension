<template>
    <div class="color-setting">
        <translate :say="label"/>
        <input-field type="color" v-model="currentBase" :title="baseTitle" :disabled="baseDisabled"/>
        <input-field type="color" v-model="currentHover" :title="hoverTitle" :disabled="hoverDisabled"/>
    </div>
</template>

<script>
    import Translate from '@vue/Components/Translate';
    import InputField from '@vue/Components/Form/InputField';

    export default {
        components: {InputField, Translate},

        props: {
            name  : String,
            type  : String,
            colors: Object
        },

        data() {
            let keyBase  = `${this.name}-${this.type}`,
                keyHover = `${this.name}-hover-${this.type}`;

            return {
                defaultBase : this.colors[keyBase],
                defaultHover: this.colors[keyHover],
                currentBase : this.colors[keyBase],
                currentHover: this.colors[keyHover],
                keyBase,
                keyHover
            };
        },

        computed: {
            label() {
                return this.type === 'bg' ? 'BackgroundColorLabel':'ForegroundColorLabel';
            },
            baseTitle() {
                return this.type === 'bg' ? 'BackgroundColorBaseTitle':'ForegroundColorBaseTitle';
            },
            hoverTitle() {
                return this.type === 'bg' ? 'BackgroundColorHoverTitle':'ForegroundColorHoverTitle';
            },
            baseDisabled() {
                return this.defaultBase === 'inherit';
            },
            hoverDisabled() {
                return this.defaultHover === 'inherit';
            }
        },

        methods: {
            update() {
                let colors = {};

                colors[this.keyBase] = this.currentBase;
                colors[this.keyHover] = this.currentHover;

                this.$emit('update', colors);
            }
        },

        watch: {
            colors: {
                deep: true,
                handler(value) {
                    this.defaultBase = value[this.keyBase];
                    this.defaultHover = value[this.keyHover];
                    this.currentBase = value[this.keyBase];
                    this.currentHover = value[this.keyHover];
                }
            },
            currentBase() {
                this.update();
            },
            currentHover() {
                this.update();
            }
        }
    };
</script>

<style lang="scss">

</style>