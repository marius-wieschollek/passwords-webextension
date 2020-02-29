<template>
    <div class="color-setting">
        <translate :say="label"/>
        <input type="color" v-model="currentBase" :disabled="!baseEnabled"/>
        <input type="color" v-model="currentHover" :disabled="!hoverEnabled"/>
    </div>
</template>

<script>
    import Translate from '@vue/Components/Translate';

    export default {
        components: {Translate},

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
                return this.type === 'bg' ? 'CustomColorsBackground':'CustomColorsForeground';
            },
            baseEnabled() {
                return this.defaultBase.length === 7;
            },
            hoverEnabled() {
                return this.defaultHover.length === 7;
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
            currentBase(value) {
                if(this.defaultBase !== value) this.update();
            },
            currentHover(value) {
                if(this.defaultHover !== value) this.update();
            }
        }
    };
</script>

<style lang="scss">

</style>