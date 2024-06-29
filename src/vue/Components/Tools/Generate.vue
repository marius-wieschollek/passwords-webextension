<template>
    <div class="tools-generate-password">
        <div class="generate-password-container">
            <div class="generate-password-wrapper" :title="title">
                <input ref="password" type="text" id="password" v-model="password" :placeholder="placeholder">
            </div>
            <div class="options">
                <div class="option" @click="generatePassword">
                    <icon icon="redo" font="solid" :spin="generating" />
                </div>
                <icon icon="clipboard" @click="copy()" draggable="true" @dragstart="drag($event)" />
                <!--                <icon icon="paste" font="solid"/>-->
            </div>
        </div>
        <div class="generate-password-options">
            <div class="option numbers">
                <slider-field id="generate-add-numbers" v-model=" numbers" />
                <translate tag="label" for="generate-add-numbers" say="LabelGenerateAddNumbers" />
            </div>
            <div class="option special">
                <slider-field id="generate-add-special" v-model="special" />
                <translate tag="label" for="generate-add-special" say="LabelGenerateAddSpecial" />
            </div>
            <div class="option strength">
                <translate tag="label" for="generate-add-strength" say="LabelGenerateStrength" />
                <select-field id="generate-add-strength" v-model="strength" :options="strengthOptions" />
            </div>
        </div>
    </div>
</template>

<script>
    import LocalisationService from '@js/Services/LocalisationService';
    import Icon                from '@vue/Components/Icon';
    import ToastService        from '@js/Services/ToastService';
    import ErrorManager        from '@js/Manager/ErrorManager';
    import SliderField         from '@vue/Components/Form/SliderField';
    import Translate           from '@vue/Components/Translate';
    import SelectField         from '@vue/Components/Form/SelectField';
    import MessageService      from '@js/Services/MessageService';
    import SettingsService     from '@js/Services/SettingsService';
    import ClipboardService from "@js/Services/ClipboardService";

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
            let promises = [
                this.loadSetting('strength'),
                this.loadSetting('numbers'),
                this.loadSetting('special')
            ];

            Promise.all(promises).then(() => {
                this.generating = false;
                this.generatePassword();
            });
        },

        methods: {
            async loadSetting(type) {
                this[type] = await SettingsService.getValue(`password.generator.${type}`);
            },
            copy() {
                let data  = this.password,
                    label = LocalisationService.translate('PropertyPassword');
                ClipboardService.writeText(data);

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
        display             : grid;
        margin              : .75rem .5rem 0;
        grid-template-areas : "numbers special" "strength strength";
        grid-row-gap        : .5rem;

        .option {
            display     : flex;
            align-items : center;
            gap         : .25rem;

            label {
                cursor    : pointer;
                flex-grow : 1;
            }

            .input-slider {
                font-size : 14px;
            }

            &.numbers {
                grid-area : numbers;
            }

            &.special {
                grid-area : special;
            }

            &.strength {
                grid-area : strength;

                .input-select {
                    flex-grow : 1;
                }
            }
        }
    }
}
</style>