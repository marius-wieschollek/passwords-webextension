<template>
    <div class="tools-generate-password">
        <div class="generate-password-container">
            <div class="generate-password-wrapper" :title="title">
                <input ref="password" type="text" id="password" v-model="password" :placeholder="placeholder">
            </div>
            <div class="options">
                <div class="option" @click="generatePassword">
                    <icon icon="redo" font="solid" :spin="generating"/>
                </div>
                <icon icon="clipboard" @click="copy()" draggable="true" @dragstart="drag($event)"/>
                <!--                <icon icon="paste" font="solid"/>-->
            </div>
        </div>
        <div class="generate-password-options">
            <div class="option">
                <slider-field id="generate-add-numbers" v-model=" numbers"/>
                <translate tag="label" for="generate-add-numbers" say="LabelGenerateAddNumbers"/>
            </div>
            <div class="option">
                <slider-field id="generate-add-special" v-model="special"/>
                <translate tag="label" for="generate-add-special" say="LabelGenerateAddSpecial"/>
            </div>
            <div class="option">
                <translate tag="label" for="generate-add-strength" say="LabelGenerateStrength"/>
                <select-field id="generate-add-strength" v-model="strength" :options="strengthOptions"/>
            </div>
        </div>
    </div>
</template>

<script>
    import LocalisationService from '@js/Services/LocalisationService';
    import Icon from '@vue/Components/Icon';
    import ToastService from '@js/Services/ToastService';
    import ErrorManager from '@js/Manager/ErrorManager';
    import SliderField from '@vue/Components/Form/SliderField';
    import Translate from '@vue/Components/Translate';
    import SelectField from '@vue/Components/Form/SelectField';
    import MessageService from '@js/Services/MessageService';
    import SettingsService from "@js/Services/SettingsService";

    export default {
        components: {SelectField, Translate, SliderField, Icon},
        data() {
            return {
                password   : '',
                title      : '',
                generating : true,
                numbers    : false,
                special    : false,
                strength   : 1,
                placeholder: LocalisationService.translate('GeneratedPasswordPlaceholder')
            };
        },

        computed: {
            strengthOptions() {
                return [
                    {
                        id   : 0,
                        label: 'LabelGeneratorStrengthLow'
                    },
                    {
                        id   : 1,
                        label: 'LabelGeneratorStrengthStandard'
                    },
                    {
                        id   : 2,
                        label: 'LabelGeneratorStrengthMedium'
                    },
                    {
                        id   : 3,
                        label: 'LabelGeneratorStrengthHigh'
                    },
                    {
                        id   : 4,
                        label: 'LabelGeneratorStrengthUltra'
                    }
                ];
            }
        },

        mounted() {
            Promise.all(
                [
                    this.loadSetting('strength'),
                    this.loadSetting('numbers'),
                    this.loadSetting('special')
                ]
            ).then(() => {
                this.generating = false;
                this.generatePassword();
            });
        },

        methods: {
            loadSetting(type) {
                new Promise((resolve) => {
                    SettingsService
                        .getValue(`password.generator.${type}`)
                        .then((v) => {
                            this[type] = v;
                            resolve();
                        });
                });
            },
            copy() {
                let data  = this.password,
                    label = LocalisationService.translate('PropertyPassword');
                navigator.clipboard.writeText(data);

                ToastService
                    .success(['PasswordPropertyCopied', label])
                    .catch(ErrorManager.catch);
            },
            drag(event) {
                event.dataTransfer.setData('text/plain', this.password);
            },
            async generatePassword() {
                if(this.generating) return;
                this.generating = true;
                let response = /** @type {Message} **/ await MessageService
                    .send({type: 'password.generate', payload: {numbers: this.numbers, special: this.special, strength: this.strength}});
                let data = response.getPayload();
                if(data.success) {
                    this.password = data.password;
                    this.title = LocalisationService.translate('GeneratedPasswordTitle', data.words.join(' '));
                }
                this.generating = false;
            }
        },
        watch  : {
            numbers() {
                this.generatePassword();
            },
            special() {
                this.generatePassword();
            },
            strength() {
                this.generatePassword();
            }
        }
    };
</script>

<style lang="scss">
.tools-generate-password {

    .generate-password-container {
        border-bottom : 2px solid var(--element-active-fg-color);
        display       : flex;

        .generate-password-wrapper {
            flex-grow : 1;

            input#password {
                width            : 100%;
                line-height      : 3rem;
                padding          : 0 .5rem;
                border           : none;
                background-color : var(--element-active-hover-bg-color);
                color            : var(--element-active-hover-fg-color);
            }
        }

        .options {
            display : flex;

            > .icon,
            .option {
                text-align       : center;
                width            : 3rem;
                line-height      : 3rem;
                display          : inline-block;
                background-color : var(--element-active-hover-bg-color);
                color            : var(--element-active-hover-fg-color);
                transition       : var(--button-transition);
                cursor           : pointer;

                .icon {
                    display    : inline-block;
                    width      : 3rem;
                    height     : 3rem;
                    text-align : center;
                }

                &:hover {
                    background-color : var(--button-hover-bg-color);
                    color            : var(--button-hover-fg-color);
                }
            }
        }
    }

    .generate-password-options {
        display        : grid;
        margin         : .75rem .5rem 0;
        grid-auto-flow : column;

        .option {
            display     : flex;
            align-items : center;

            label {
                cursor : pointer;
            }

            .input-slider {
                margin-right : .25rem;
            }

            #generate-add-strength {
                padding       : 0;
                border        : 0;
                background    : var(--button-bg-color);
                color         : var(--button-fg-color);
                border-radius : var(--button-border-radius);
                width         : 5rem;
                margin-left   : .25rem;

                &:hover,
                &:active {
                    background : var(--button-hover-bg-color);
                    color      : var(--button-hover-fg-color);
                }
            }
        }
    }
}
</style>