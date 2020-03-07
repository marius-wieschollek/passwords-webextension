<template>
    <div class="color-setting">
        <translate :say="label"/>
        <input-field type="checkbox" :title="title" v-model="currentBase"/>
        <input-field type="checkbox" :title="title" v-model="currentHover"/>
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
            let keyBase      = `${this.name}-${this.type}`,
                keyHover     = `${this.name}-hover-${this.type}`,
                inheritBase  = this.colors[keyBase] === 'inherit',
                inheritHover = this.colors[keyHover] === 'inherit';

            return {
                colorBase   : inheritBase ? '#000':this.colors[keyBase],
                colorHover  : inheritHover ? '#000':this.colors[keyHover],
                defaultBase : inheritBase,
                defaultHover: inheritHover,
                currentBase : inheritBase,
                currentHover: inheritHover,
                keyBase,
                keyHover
            };
        },

        computed: {
            label() {
                return this.type === 'bg' ? 'BackgroundInheritLabel':'ForegroundInheritLabel';
            },
            title() {
                return this.type === 'bg' ? 'BackgroundInheritTitle':'ForegroundInheritTitle';
            }
        },

        methods: {
            update() {
                let colors = {};

                colors[this.keyBase] = this.currentBase ? 'inherit':this.colorBase;
                colors[this.keyHover] = this.currentHover ? 'inherit':this.colorHover;

                this.$emit('update', colors);
            }
        },

        watch: {
            colors: {
                deep: true,
                handler(value) {
                    let inheritBase  = this.colors[this.keyBase] === 'inherit',
                        inheritHover = this.colors[this.keyHover] === 'inherit';

                    if(!inheritBase) this.colorBase = value[this.keyBase];
                    if(!inheritHover) this.colorHover = value[this.keyHover];
                    this.defaultBase = inheritBase;
                    this.defaultHover = inheritHover;
                    this.currentBase = inheritBase;
                    this.currentHover = inheritHover;
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