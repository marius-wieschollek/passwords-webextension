<template>
    <div class="foldout-container">
        <div :key="name" v-for="(tab, name) in tabs">
            <div class="foldout-tab" :class="{ active: isActive(name) }">
                <translate :say="tab" class="label" @click="setActive(name)" v-if="translate"/>
                <span class="label" @click="setActive(name)" v-else>{{tab}}</span>
                <slot :name="`${name}-tab-open`" v-if="isActive(name)"/>
                <slot :name="`${name}-tab-closed`" v-if="!isActive(name)"/>
                <slot :name="`${name}-tab`"/>
            </div>
            <div :class="{ active: isActive(name) }" class="foldout-content">
                <keep-alive>
                    <slot :name="name"/>
                </keep-alive>
            </div>
        </div>
    </div>
</template>

<script>
    import Translate from '@vue/Components/Translate';

    export default {
        components: {Translate},

        props: {
            tabs       : {
                type: Object
            },
            translate  : {
                type   : Boolean,
                default: true
            },
            initialOpen: {
                type   : Boolean,
                default: false
            }
        },

        data() {
            let tab = null;
            if(this.initialOpen) tab = Object.keys(this.tabs)[0];

            return {tab};
        },

        methods: {
            isActive(tab) {
                return tab === this.tab;
            },
            setActive(tab) {
                if(!this.initialOpen && this.tab === tab) {
                    this.tab = null;
                    return;
                }

                this.tab = tab;
            }
        },

        watch: {
            tabs(value) {
                if(!value.hasOwnProperty(this.tab)) {
                    if(this.initialOpen) this.tab = Object.keys(value)[0];
                }
            }
        }
    };
</script>

<style lang="scss">
    .foldout-container {
        .foldout-tab {
            cursor           : pointer;
            display          : flex;
            flex-direction   : row;
            overflow         : hidden;
            background-color : var(--content-secondary-background-color);
            color            : var(--content-secondary-text-color);
            box-shadow       : 0 -1px 0 var(--content-secondary-border-color) inset;

            &:hover {
                background-color : var(--content-secondary-hover-background-color);
                color            : var(--content-secondary-hover-text-color);
                box-shadow       : 0 -1px 0 var(--content-secondary-hover-border-color) inset;
            }

            &.active {
                background-color : var(--content-primary-background-color);
                color            : var(--content-primary-text-color);
                box-shadow       : 0 -1px 0 var(--content-primary-hover-border-color) inset, 0 -4px 0 var(--content-primary-border-color) inset;

                &:hover {
                    background-color : var(--content-primary-hover-background-color);
                    color            : var(--content-primary-hover-text-color);
                }
            }

            > * {
                flex-grow   : 0;
                flex-shrink : 0;
            }

            > .label {
                flex-grow  : 1;
                min-width  : 100vw;
                padding    : 1rem;
                transition : min-width .15s ease-in-out;
            }

            &.active > .label,
            &:hover > .label {
                flex-shrink : 1;
                min-width   : 50vw;
            }

            .options {
                display : flex;
            }

            .option,
            .icon {
                padding    : 1rem;
                display    : inline-block;
                transition : color .15s ease-in-out, background-color .15s ease-in-out;

                &:hover {
                    background-color : var(--element-primary-background-color);
                    color            : var(--element-primary-text-color);
                }
            }

            .option .icon {
                padding: 0;
            }
        }

        .foldout-content {
            display       : none;
            margin-bottom : 3rem;

            &.active {
                display : block;
            }
        }
    }

    body.mobile {
        .foldout-container .foldout-tab {
            > .label {
                flex-shrink : 1;
                min-width   : 50vw;
            }

            .options {
                opacity          : 1;
                transition       : none;
                background-color : transparent;
                color            : var(--content-primary-text-color);
            }

            &:hover {
                .options {
                    opacity          : 1;
                    transition       : none;
                    background-color : transparent;
                    color            : var(--element-primary-hover-text-color);
                }
            }
        }
    }
</style>