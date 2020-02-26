<template>
    <div class="foldout-container">
        <div v-for="tab in getTabs" :key="tab.id">
            <div class="foldout-tab" :class="{ active: tab.active }">
                <translate :say="tab.label" class="label" @click="setActive(tab.id)" v-if="translate">
                    <icon :icon="tab.icon" :font="tab.iconFont" slot="before" v-if="tab.icon"/>
                </translate>
                <span class="label" @click="setActive(tab.id)" v-else>
                    <icon :icon="tab.icon" :font="tab.iconFont" v-if="tab.icon"/>
                    {{tab.label}}
                </span>
                <slot :name="`${tab.id}-tab-open`" v-if="isActive(tab.id)"/>
                <slot :name="`${tab.id}-tab-closed`" v-if="!isActive(tab.id)"/>
                <slot :name="`${tab.id}-tab`"/>
            </div>
            <div :class="{ active: isActive(tab.id) }" class="foldout-content">
                <keep-alive>
                    <slot :name="tab.id" v-if="isActive(tab.id)"/>
                </keep-alive>
            </div>
        </div>
    </div>
</template>

<script>
    import Translate from '@vue/Components/Translate';
    import Icon from '@vue/Components/Icon';

    export default {
        components: {Icon, Translate},

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

        computed: {
            getTabs() {
                let tabs = [];

                for(let id in this.tabs) {
                    if(!this.tabs.hasOwnProperty(id)) continue;
                    let tab = this.tabs[id];
                    if(typeof tab === 'string') tab = {label: tab};
                    if(!tab.hasOwnProperty('icon')) tab.icon = null;
                    if(!tab.hasOwnProperty('iconFont')) tab.iconFont = null;
                    tab.id = id;
                    tab.active = this.isActive(tab.id);

                    tabs.push(tab);
                }

                return tabs;
            }
        },

        methods: {
            isActive(tab) {
                return tab === this.tab;
            },
            setActive(tab) {
                if(!this.initialOpen && this.tab === tab) {
                    this.tab = null;
                    this.$emit('switch', {tab: null});
                    return;
                }

                this.tab = tab;
                this.$emit('switch', {tab});
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

            > * {
                flex-grow   : 0;
                flex-shrink : 0;
            }

            > .label {
                flex-grow     : 1;
                min-width     : 100vw;
                padding       : 1rem;
                transition    : min-width .15s ease-in-out;
                white-space   : nowrap;
                text-overflow : ellipsis;
                overflow      : hidden;

                .icon {
                    margin-right : .5rem;
                }
            }

            .options {
                display          : flex;
                background-color : var(--content-secondary-background-color);
                box-shadow       : 0 -1px 0 var(--content-secondary-border-color) inset;
            }

            &.active,
            &:hover {
                > .label {
                    flex-shrink : 1;
                    min-width   : 50vw;
                }

                .options {
                    background-color : var(--content-secondary-hover-background-color);
                    box-shadow       : 0 -1px 0 var(--content-secondary-hover-border-color) inset;
                }
            }

            &.active {
                background-color : var(--content-primary-background-color);
                color            : var(--content-primary-text-color);
                box-shadow       : 0 -1px 0 var(--content-primary-hover-border-color) inset, 0 -4px 0 var(--content-primary-border-color) inset;

                .options {
                    background-color : var(--content-primary-background-color);
                    box-shadow       : 0 -1px 0 var(--content-primary-hover-border-color) inset, 0 -4px 0 var(--content-primary-border-color) inset;
                }

                &:hover {
                    background-color : var(--content-primary-hover-background-color);
                    color            : var(--content-primary-hover-text-color);

                    .options {
                        background-color : var(--content-primary-hover-background-color);
                        color            : var(--content-primary-hover-text-color);
                    }
                }
            }

            .option,
            > .icon,
            div .icon {
                padding    : 1rem;
                display    : inline-block;
                transition : color .15s ease-in-out, background-color .15s ease-in-out;

                &:hover {
                    background-color : var(--element-primary-background-color);
                    color            : var(--element-primary-text-color);
                    box-shadow       : 0 -1px 0 var(--content-primary-hover-border-color) inset, 0 -4px 0 var(--content-primary-border-color) inset;
                }
            }

            .option {
                padding : 0;

                .icon {
                    padding    : 1rem;
                    box-shadow : none;

                    &:hover {
                        background-color : transparent;
                        box-shadow : none;
                    }
                }
            }
        }

        .foldout-content {
            display        : none;
            padding-bottom : 1rem;

            &.active {
                display       : block;
                border-bottom : 1px solid var(--content-secondary-border-color);
            }
        }

        > div:last-child {
            .foldout-content.active {
                border-bottom : none;
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
                opacity    : 1;
                transition : none;
            }

            &:hover {
                .options {
                    opacity    : 1;
                    transition : none;
                }
            }
        }
    }
</style>