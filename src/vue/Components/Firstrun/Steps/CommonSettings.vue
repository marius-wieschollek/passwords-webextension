<template>
    <div class="server-setup-wizard">
        <translate tag="h2" say="FirstRunSettingsTitle"/>
        <translate tag="p" class="description" say="FirstRunSettingsText"/>
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
</template>

<script>
    import Translate from "@vue/Components/Translate";
    import ButtonField from "@vue/Components/Form/ButtonField";
    import SliderField from "@vue/Components/Form/SliderField";
    import MessageService from "@js/Services/MessageService";
    import ErrorManager from "@js/Manager/ErrorManager";

    export default {
        components: {Translate, ButtonField, SliderField},
        data() {
            MessageService.send({type: 'firstrun.settings'})
                          .then((d) => {this.update(d);})
                          .catch(ErrorManager.catch);

            return {
                autofill : false,
                quicksave: false,
                incognito: false
            };
        },
        methods: {
            update(m) {
                let payload = m.getPayload();

                this.autofill = payload.autofill;
                this.quicksave = payload.quicksave;
                this.incognito = payload.incognito;
            },
            save() {
                let payload = {
                    autofill : this.autofill,
                    quicksave: this.quicksave,
                    incognito: this.incognito
                };

                MessageService.send({type: 'firstrun.save', payload})
                              .then(() => {this.$emit('complete');})
                              .catch(ErrorManager.catch);
            }
        }
    };
</script>

<style lang="scss">
.server-setup-wizard {
    p.description {
        margin     : .25rem 0 1rem;
        text-align : center;
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
}
</style>