<template>
    <div class="color-setting">
        <translate :say="label"/>
        <input type="checkbox" v-model="currentBase"/>
        <input type="checkbox" v-model="currentHover"/>
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
                colorBase   : this.colors[keyBase],
                colorHover  : this.colors[keyHover],
                defaultBase : this.colors[keyBase].length > 7,
                defaultHover: this.colors[keyHover].length > 7,
                currentBase : this.colors[keyBase].length > 7,
                currentHover: this.colors[keyHover].length > 7,
                keyBase,
                keyHover
            };
        },

        computed: {
            label() {
                return this.type === 'bg' ? 'CustomAlphaBackground':'CustomAlphaForeground';
            }
        },

        methods: {
            update() {
                let colors = {};

                colors[this.keyBase] = this.colorBase.substr(0, 7);
                colors[this.keyHover] = this.colorHover.substr(0, 7);

                if(this.currentBase) colors[this.keyBase] += '00';
                if(this.currentHover) colors[this.keyHover] += '00';

                this.$emit('update', colors);
            }
        },

        watch: {
            colors: {
                deep: true,
                handler(value) {
                    this.colorBase = value[this.keyBase];
                    this.colorHover = value[this.keyHover];
                    this.defaultBase = this.colorBase.length > 7;
                    this.defaultHover = this.colorHover.length > 7;
                    this.currentBase = this.defaultBase;
                    this.currentHover = this.defaultHover;
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