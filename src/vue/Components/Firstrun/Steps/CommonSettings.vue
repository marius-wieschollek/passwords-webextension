<template>
    <div class="server-setup-wizard" v-if="loaded">
        <translate tag="h2" say="FirstRunSettingsTitle"/>
        <p :class="{small:isSmall}" class="description">{{ description }}</p>
        <ul class="first-run-settings">
            <li>
                <slider-field id="setting-autofill" v-model="autofill"/>
                <translate tag="label" say="SettingsPasteAutofillEnabled" for="setting-autofill"/>
            </li>
            <li>
                <slider-field id="setting-quicksave" v-model="quicksave"/>
                <translate tag="label" say="SettingsNotifyPasswordQuicksave" for="setting-quicksave"/>
            </li>
            <li>
                <slider-field id="setting-incognito" v-model="incognito"/>
                <translate tag="label" say="SettingsMiningIncognitoHide" for="setting-incognito"/>
            </li>
        </ul>
        <button-field value="FirstRunSettingsSave" @click="save"/>
    </div>
    <div class="server-setup-wizard" v-else>
        <translate tag="h2" say="FirstRunServerCheckTitle"/>
        <div class="first-run-loader">
            <icon icon="spinner" font="solid" :spin="true"/>
        </div>
    </div>
</template>

<script>
    import Translate from "@vue/Components/Translate";
    import ButtonField from "@vue/Components/Form/ButtonField";
    import SliderField from "@vue/Components/Form/SliderField";
    import MessageService from "@js/Services/MessageService";
    import ErrorManager from "@js/Manager/ErrorManager";
    import LocalisationService from "@js/Services/LocalisationService";
    import Icon from "@vue/Components/Icon.vue";

    export default {
        components: {Icon, Translate, ButtonField, SliderField},
        data() {
            MessageService.send({type: 'firstrun.settings'})
                          .then((d) => {this.update(d);})
                          .catch(ErrorManager.catch);

            return {
                loaded     : false,
                autofill   : false,
                quicksave  : false,
                incognito  : false,
                description: LocalisationService.translate('FirstRunSettingsText')
            };
        },
        computed: {
            isSmall() {
                return this.description.length > 84;
            }
        },
        methods : {
            update(m) {
                let payload = m.getPayload();

                this.autofill = payload.autofill;
                this.quicksave = payload.quicksave;
                this.incognito = payload.incognito;
                this.loaded   = true;
            },
            save() {
                let payload = {
                    autofill : this.autofill,
                    quicksave: this.quicksave,
                    incognito: this.incognito
                };

                MessageService.send({type: 'firstrun.save', payload})
                              .catch(ErrorManager.catch);

                this.$emit('complete');
            }
        }
    };
</script>

<style lang="scss">
.server-setup-wizard {
    p.description {
        margin     : .25rem 0 1rem;
        text-align : center;

        &.small {
            font-size : .75rem;
            margin    : 0;
        }
    }

    .first-run-settings {
        list-style-type : none;
        padding         : 0;
        margin          : 0;
        flex-grow       : 1;

        li {
            padding     : .5rem 0;
            display     : flex;
            gap         : 1rem;
            align-items : center;

            label {
                cursor : pointer;
            }
        }
    }

    .first-run-loader {
        display         : flex;
        align-items     : center;
        justify-content : center;
        height          : 100%;
        font-size       : 4rem;
    }
}
</style>