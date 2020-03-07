<template>
    <div class="setting">
        <translate tag="label" for="badge-icon" say="SettingsBadgeIcon"/>
        <select-field id="badge-icon" :options="options" v-model="model"/>
    </div>
</template>

<script>
    import SelectField from '@vue/Components/Form/SelectField';
    import Translate from '@vue/Components/Translate';

    export default {
        components: {Translate, SelectField},

        props: ['value'],

        data() {
            return {
                model: this.mapValue(this.value)
            };
        },

        computed: {
            options() {
                return {
                    auto       : 'BadgeIconAuto',
                    light      : 'BadgeIconLight',
                    medium     : 'BadgeIconMedium',
                    dark       : 'BadgeIconDark',
                    'new-light': 'BadgeIconNewLight',
                    'new'      : 'BadgeIconNewMedium',
                    'new-dark' : 'BadgeIconNewDark'
                };
            }
        },

        methods: {
            mapValue(value) {
                if(!value) return 'auto';
                if(value === 'passwords') return 'medium';

                return value.substr(10);
            },
            mapModel(value) {
                if(value === 'auto') return null;
                if(value === 'medium') return 'passwords';

                return `passwords-${value}`;
            }
        },

        watch: {
            value(value) {
                this.model = this.mapValue(value);
            },
            model(value) {
                this.$emit('input', this.mapModel(value));
            }
        }
    };
</script>